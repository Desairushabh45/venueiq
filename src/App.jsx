import React, { useState, useEffect } from 'react';
import { Activity, Bell, Map as MapIcon, Users } from 'lucide-react';
import StadiumMap from './components/StadiumMap';
import QueueTracker from './components/QueueTracker';
import AlertSystem from './components/AlertSystem';
import './index.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-container">
      {/* Left Panel: Queue Wait Times */}
      <div className="panel left-panel">
        <h2>
          <Users size={20} className="text-accent" />
          Queue Tracker
        </h2>
        <QueueTracker />
      </div>

      {/* Center: Live Heatmap */}
      <div className="center-panel">
        <div className="stadium-header">
          <h1>VenueIQ</h1>
          <p>Live Crowd Heatmap • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <StadiumMap />
      </div>

      {/* Right Panel: Alerts & Info */}
      <div className="panel right-panel">
        <h2>
          <Bell size={20} className="text-accent" />
          Live Alerts
        </h2>
        <AlertSystem />
      </div>
    </div>
  );
}

export default App;
