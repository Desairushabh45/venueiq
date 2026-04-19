import { useState, useEffect } from 'react';
import { Coffee, DoorOpen, Bath, AlertTriangle, Info } from 'lucide-react';

const INITIAL_QUEUES = [
  { id: 'g1', name: 'Gate A', type: 'gate', icon: DoorOpen, waitTime: 5 },
  { id: 'g2', name: 'Gate B', type: 'gate', icon: DoorOpen, waitTime: 12 },
  { id: 'f1', name: 'North Food Stall', type: 'food', icon: Coffee, waitTime: 25 },
  { id: 'f2', name: 'South Bar', type: 'food', icon: Coffee, waitTime: 8 },
  { id: 't1', name: 'East Toilets', type: 'toilet', icon: Bath, waitTime: 3 },
  { id: 't2', name: 'West Toilets', type: 'toilet', icon: Bath, waitTime: 15 },
];

const INITIAL_ALERTS = [
  { id: 1, type: 'emergency', title: 'Medical Incident', message: 'Medical staff deployed to West Stand, Block 102. Please keep aisles clear.', time: '2 mins ago', icon: AlertTriangle },
  { id: 2, type: 'announcement', title: 'Post-Match Traffic', message: 'Due to roadworks on Main St, please use alternative exits towards the North Station.', time: '15 mins ago', icon: Info }
];

const MOCK_NEW_ALERTS = [
  { type: 'announcement', title: 'Merchandise Discount', message: '20% off all jerseys at the East Stand Megastore for the next 30 minutes!', icon: Info },
  { type: 'emergency', title: 'Congestion Warning', message: 'High density detected at Gate C. Please use Gates A or B if possible.', icon: AlertTriangle }
];

export function useSimulatedData() {
  const [queues, setQueues] = useState(INITIAL_QUEUES);
  const [densities, setDensities] = useState({ north: 25, south: 65, east: 15, west: 85 });
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  useEffect(() => {
    // Queue simulation
    const queueInterval = setInterval(() => {
      setQueues(prev => prev.map(q => {
        let newWaitTime = q.waitTime + (Math.floor(Math.random() * 6) - 2);
        return { ...q, waitTime: Math.min(Math.max(newWaitTime, 0), 45) };
      }));
    }, 4000);

    // Density simulation
    const densityInterval = setInterval(() => {
      setDensities(prev => {
        const newDensities = { ...prev };
        Object.keys(newDensities).forEach(key => {
          let newVal = newDensities[key] + (Math.floor(Math.random() * 21) - 10);
          newDensities[key] = Math.min(Math.max(newVal, 0), 100);
        });
        return newDensities;
      });
    }, 4000);

    // Alerts simulation
    const timeout1 = setTimeout(() => {
      setAlerts(prev => [{ ...MOCK_NEW_ALERTS[0], id: Date.now(), time: 'Just now' }, ...prev]);
    }, 15000);

    const timeout2 = setTimeout(() => {
      setAlerts(prev => [{ ...MOCK_NEW_ALERTS[1], id: Date.now() + 1, time: 'Just now' }, ...prev]);
    }, 35000);

    return () => {
      clearInterval(queueInterval);
      clearInterval(densityInterval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return { queues, densities, alerts };
}
