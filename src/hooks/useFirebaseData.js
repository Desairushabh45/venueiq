import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { Coffee, DoorOpen, Bath, AlertTriangle, Info } from 'lucide-react';
import { db } from '../firebase';

// ── Seed / fallback data ──────────────────────────────────────────────────────
const SEED_QUEUES = {
  g1: { name: 'Gate A', type: 'gate', waitTime: 5 },
  g2: { name: 'Gate B', type: 'gate', waitTime: 12 },
  f1: { name: 'North Food Stall', type: 'food', waitTime: 25 },
  f2: { name: 'South Bar', type: 'food', waitTime: 8 },
  t1: { name: 'East Toilets', type: 'toilet', waitTime: 3 },
  t2: { name: 'West Toilets', type: 'toilet', waitTime: 15 },
};

const SEED_DENSITIES = { north: 25, south: 65, east: 15, west: 85 };

const SEED_ALERTS = [
  {
    type: 'emergency',
    title: 'Medical Incident',
    message: 'Medical staff deployed to West Stand, Block 102. Please keep aisles clear.',
    time: '2 mins ago',
  },
  {
    type: 'announcement',
    title: 'Post-Match Traffic',
    message: 'Due to roadworks on Main St, please use alternative exits towards the North Station.',
    time: '15 mins ago',
  },
];

// Map type → lucide icon component (icons can't be stored in Firebase)
const ICON_MAP = {
  gate: DoorOpen,
  food: Coffee,
  toilet: Bath,
  emergency: AlertTriangle,
  announcement: Info,
};

// ── Local simulation (used when Firebase is unavailable) ──────────────────────
const MOCK_NEW_ALERTS = [
  {
    type: 'announcement',
    title: 'Merchandise Discount',
    message: '20% off all jerseys at the East Stand Megastore for the next 30 minutes!',
  },
  {
    type: 'emergency',
    title: 'Congestion Warning',
    message: 'High density detected at Gate C. Please use Gates A or B if possible.',
  },
];

function useLocalSimulation(setQueues, setDensities, setAlerts) {
  useEffect(() => {
    // Queue simulation
    const queueInterval = setInterval(() => {
      setQueues((prev) =>
        prev.map((q) => {
          const delta = Math.floor(Math.random() * 6) - 2;
          return { ...q, waitTime: Math.min(Math.max(q.waitTime + delta, 0), 45) };
        })
      );
    }, 4000);

    // Density simulation
    const densityInterval = setInterval(() => {
      setDensities((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const delta = Math.floor(Math.random() * 21) - 10;
          next[key] = Math.min(Math.max(next[key] + delta, 0), 100);
        });
        return next;
      });
    }, 4000);

    // Alert simulation
    const timeout1 = setTimeout(() => {
      setAlerts((prev) => [
        { ...MOCK_NEW_ALERTS[0], id: `local-${Date.now()}`, time: 'Just now', icon: Info },
        ...prev,
      ]);
    }, 15000);

    const timeout2 = setTimeout(() => {
      setAlerts((prev) => [
        { ...MOCK_NEW_ALERTS[1], id: `local-${Date.now() + 1}`, time: 'Just now', icon: AlertTriangle },
        ...prev,
      ]);
    }, 35000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(densityInterval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [setQueues, setDensities, setAlerts]);
}

// ── Transform raw Firebase queue object → array used by UI ────────────────────
function dbQueuesToArray(snapshot) {
  const result = [];
  snapshot.forEach((child) => {
    const val = child.val();
    result.push({
      id: child.key,
      name: val.name,
      type: val.type,
      waitTime: val.waitTime,
      icon: ICON_MAP[val.type] || Coffee,
    });
  });
  return result;
}

// ── Transform raw Firebase alerts object → array used by UI ──────────────────
function dbAlertsToArray(snapshot) {
  const result = [];
  snapshot.forEach((child) => {
    const val = child.val();
    result.unshift({
      id: child.key,
      type: val.type,
      title: val.title,
      message: val.message,
      time: val.time || 'Just now',
      icon: ICON_MAP[val.type] || Info,
    });
  });
  return result;
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useFirebaseData() {
  const [queues, setQueues] = useState(() =>
    Object.entries(SEED_QUEUES).map(([id, q]) => ({ id, ...q, icon: ICON_MAP[q.type] }))
  );
  const [densities, setDensities] = useState(SEED_DENSITIES);
  const [alerts, setAlerts] = useState([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // ── Firebase mode ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!db) return; // No Firebase DB — fallback to local simulation

    setIsFirebaseConnected(true);

    // ── Seed queues if the node doesn't exist ──
    const queuesRef = ref(db, 'queues');
    const unsubQueues = onValue(queuesRef, (snapshot) => {
      if (snapshot.exists()) {
        setQueues(dbQueuesToArray(snapshot));
      } else {
        // First run: seed data into DB
        set(queuesRef, SEED_QUEUES);
      }
    });

    // ── Seed densities if the node doesn't exist ──
    const densitiesRef = ref(db, 'densities');
    const unsubDensities = onValue(densitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        setDensities(snapshot.val());
      } else {
        set(densitiesRef, SEED_DENSITIES);
      }
    });

    // ── Seed alerts if the node doesn't exist ──
    const alertsRef = ref(db, 'alerts');
    const unsubAlerts = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAlerts(dbAlertsToArray(snapshot));
      } else {
        // Seed initial alerts
        SEED_ALERTS.forEach((alert) => {
          push(alertsRef, { ...alert, createdAt: serverTimestamp() });
        });
      }
    });

    // ── Periodic updates to simulate live data changes in DB ──
    const updateInterval = setInterval(() => {
      // Update queue wait times
      const queuesUpdateRef = ref(db, 'queues');
      onValue(
        queuesUpdateRef,
        (snapshot) => {
          if (!snapshot.exists()) return;
          const updates = {};
          snapshot.forEach((child) => {
            const current = child.val().waitTime;
            const delta = Math.floor(Math.random() * 6) - 2;
            updates[`${child.key}/waitTime`] = Math.min(Math.max(current + delta, 0), 45);
          });
          import('firebase/database').then(({ update }) => {
            update(queuesUpdateRef, updates);
          });
        },
        { onlyOnce: true }
      );

      // Update densities
      const densitiesUpdateRef = ref(db, 'densities');
      onValue(
        densitiesUpdateRef,
        (snapshot) => {
          if (!snapshot.exists()) return;
          const current = snapshot.val();
          const next = {};
          Object.keys(current).forEach((key) => {
            const delta = Math.floor(Math.random() * 21) - 10;
            next[key] = Math.min(Math.max(current[key] + delta, 0), 100);
          });
          import('firebase/database').then(({ update }) => {
            update(densitiesUpdateRef, next);
          });
        },
        { onlyOnce: true }
      );
    }, 4000);

    return () => {
      unsubQueues();
      unsubDensities();
      unsubAlerts();
      clearInterval(updateInterval);
    };
  }, []);

  // ── Local simulation fallback (no DB) ──────────────────────────────────────
  useLocalSimulation(
    isFirebaseConnected ? () => {} : setQueues,
    isFirebaseConnected ? () => {} : setDensities,
    isFirebaseConnected ? () => {} : setAlerts
  );

  // ── Initialise alerts from seeds if using local mode and empty ─────────────
  useEffect(() => {
    if (!isFirebaseConnected && alerts.length === 0) {
      setAlerts(
        SEED_ALERTS.map((a, i) => ({
          ...a,
          id: `seed-${i}`,
          icon: ICON_MAP[a.type] || Info,
        }))
      );
    }
  }, [isFirebaseConnected, alerts.length]);

  // ── Admin action: post a new alert ─────────────────────────────────────────
  const postAlert = useCallback((title, message, type = 'announcement') => {
    const newAlert = {
      id: `local-${Date.now()}`,
      type,
      title,
      message,
      time: 'Just now',
      icon: ICON_MAP[type] || Info,
    };

    if (db) {
      const alertsRef = ref(db, 'alerts');
      push(alertsRef, {
        type,
        title,
        message,
        time: 'Just now',
        createdAt: serverTimestamp(),
      });
    } else {
      // Local fallback
      setAlerts((prev) => [newAlert, ...prev]);
    }
  }, []);

  return { queues, densities, alerts, postAlert };
}
