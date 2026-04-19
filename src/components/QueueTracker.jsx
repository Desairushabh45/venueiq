import React, { useState, useEffect } from 'react';
import { Coffee, DoorOpen, Bath } from 'lucide-react';
import './QueueTracker.css';

const INITIAL_QUEUES = [
  { id: 'g1', name: 'Gate A', type: 'gate', icon: DoorOpen, waitTime: 5 },
  { id: 'g2', name: 'Gate B', type: 'gate', icon: DoorOpen, waitTime: 12 },
  { id: 'f1', name: 'North Food Stall', type: 'food', icon: Coffee, waitTime: 25 },
  { id: 'f2', name: 'South Bar', type: 'food', icon: Coffee, waitTime: 8 },
  { id: 't1', name: 'East Toilets', type: 'toilet', icon: Bath, waitTime: 3 },
  { id: 't2', name: 'West Toilets', type: 'toilet', icon: Bath, waitTime: 15 },
];

export default function QueueTracker() {
  const [queues, setQueues] = useState(INITIAL_QUEUES);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueues(prev => prev.map(q => {
        // Randomly adjust wait time by -2 to +3 minutes
        const change = Math.floor(Math.random() * 6) - 2;
        let newWaitTime = q.waitTime + change;
        if (newWaitTime < 0) newWaitTime = 0;
        if (newWaitTime > 45) newWaitTime = 45; // Max cap
        return { ...q, waitTime: newWaitTime };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (time) => {
    if (time < 10) return 'var(--status-low)';
    if (time < 20) return 'var(--status-med)';
    return 'var(--status-high)';
  };

  const renderQueueSection = (type, title) => {
    const sectionQueues = queues.filter(q => q.type === type);
    return (
      <div key={type}>
        <h3 className="queue-category">{title}</h3>
        <div className="queue-list">
          {sectionQueues.map(q => {
            const Icon = q.icon;
            const progressWidth = Math.min((q.waitTime / 30) * 100, 100);
            const color = getStatusColor(q.waitTime);
            return (
              <div key={q.id} className="queue-item">
                <div className="queue-header">
                  <span className="queue-name"><Icon size={16} /> {q.name}</span>
                  <span className="queue-time" style={{ color }}>{q.waitTime} min</span>
                </div>
                <div className="progress-bg">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressWidth}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderQueueSection('gate', 'Entry Gates')}
      {renderQueueSection('food', 'Food & Drink')}
      {renderQueueSection('toilet', 'Restrooms')}
    </div>
  );
}
