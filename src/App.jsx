import React, { useState, useEffect } from 'react';
import { Bell, Users } from 'lucide-react';
import StadiumMap from './components/StadiumMap';
import QueueTracker from './components/QueueTracker';
import AlertSystem from './components/AlertSystem';
import ErrorBoundary from './components/ErrorBoundary';
import AIAssistant from './components/AIAssistant';
import { useSimulatedData } from './hooks/useSimulatedData';
import './index.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { queues, densities, alerts } = useSimulatedData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="app-container">
      {/* Left Panel: Queue Wait Times */}
      <aside className="panel left-panel" aria-label="Queue Tracker Sidebar">
        <h2>
          <Users size={20} className="text-accent" aria-hidden="true" />
          Queue Tracker
        </h2>
        <ErrorBoundary>
          <QueueTracker queues={queues} />
        </ErrorBoundary>
      </aside>

      {/* Center: Live Heatmap */}
      <section className="center-panel" aria-labelledby="main-heading">
        <header className="stadium-header">
          <h1 id="main-heading">VenueIQ</h1>
          <p>Live Crowd Heatmap • <time dateTime={currentTime.toISOString()}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></p>
        </header>
        <ErrorBoundary>
          <StadiumMap densities={densities} />
        </ErrorBoundary>
      </section>

      {/* Right Panel: Alerts & Info */}
      <aside className="panel right-panel" aria-label="Live Alerts Sidebar">
        <h2>
          <Bell size={20} className="text-accent" aria-hidden="true" />
          Live Alerts
        </h2>
        <ErrorBoundary>
          <AlertSystem alerts={alerts} />
        </ErrorBoundary>
      </aside>

      <ErrorBoundary>
        <AIAssistant contextData={{ queues, densities, alerts }} />
      </ErrorBoundary>
    </main>
  );
}

export default App;
