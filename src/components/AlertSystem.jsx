import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import './AlertSystem.css';

const INITIAL_ALERTS = [
  {
    id: 1,
    type: 'emergency',
    title: 'Medical Incident',
    message: 'Medical staff deployed to West Stand, Block 102. Please keep aisles clear.',
    time: '2 mins ago'
  },
  {
    id: 2,
    type: 'announcement',
    title: 'Post-Match Traffic',
    message: 'Due to roadworks on Main St, please use alternative exits towards the North Station.',
    time: '15 mins ago'
  }
];

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
  }
];

export default function AlertSystem() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  useEffect(() => {
    // Simulate incoming new alerts
    const timeout1 = setTimeout(() => {
      const newAlert = { ...MOCK_NEW_ALERTS[0], id: Date.now(), time: 'Just now' };
      setAlerts(prev => [newAlert, ...prev]);
    }, 15000);

    const timeout2 = setTimeout(() => {
      const newAlert = { ...MOCK_NEW_ALERTS[1], id: Date.now() + 1, time: 'Just now' };
      setAlerts(prev => [newAlert, ...prev]);
    }, 35000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  if (alerts.length === 0) {
    return (
      <div className="empty-alerts">
        <CheckCircle2 size={32} className="text-status-low" />
        <p>No active alerts</p>
      </div>
    );
  }

  return (
    <div className="alert-list">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert-item ${alert.type}`}>
          <div className="alert-icon">
            {alert.type === 'emergency' ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-message">{alert.message}</div>
            <span className="alert-time">{alert.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
