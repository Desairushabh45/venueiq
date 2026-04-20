import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Bell, Users } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import AuthButton from './components/AuthButton';

const StadiumMap = lazy(() => import('./components/StadiumMap'));
const QueueTracker = lazy(() => import('./components/QueueTracker'));
const AlertSystem = lazy(() => import('./components/AlertSystem'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useFirebaseData } from './hooks/useFirebaseData';
import { logEvent } from './firebase';
import './index.css';

function AppContent() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { queues, densities, alerts, postAlert } = useFirebaseData();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleZoneClick = useCallback((standId) => {
    logEvent('stadium_zone_clicked', { stand_id: standId });
  }, []);

  const handleAIOpen = useCallback(() => {
    logEvent('ai_assistant_opened');
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
          <Suspense fallback={<div className="loading-spinner">Loading Queues...</div>}>
            <QueueTracker queues={queues} />
          </Suspense>
        </ErrorBoundary>
      </aside>

      {/* Center: Live Heatmap */}
      <section className="center-panel" aria-labelledby="main-heading">
        <header className="stadium-header">
          <div className="stadium-header-top">
            <div className="stadium-title-group">
              <h1 id="main-heading">VenueIQ</h1>
              <p>
                Live Crowd Heatmap •{' '}
                <time dateTime={currentTime.toISOString()}>
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </p>
            </div>
            <AuthButton />
          </div>
        </header>
        <ErrorBoundary>
          <Suspense fallback={<div className="loading-spinner">Loading Map...</div>}>
            <StadiumMap densities={densities} onZoneClick={handleZoneClick} />
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Right Panel: Alerts & Info */}
      <aside className="panel right-panel" aria-label="Live Alerts Sidebar">
        <h2>
          <Bell size={20} className="text-accent" aria-hidden="true" />
          Live Alerts
        </h2>
        <ErrorBoundary>
          <Suspense fallback={<div className="loading-spinner">Loading Alerts...</div>}>
            <AlertSystem alerts={alerts} isAdmin={isAdmin} onPostAlert={postAlert} />
          </Suspense>
        </ErrorBoundary>
      </aside>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <AIAssistant contextData={{ queues, densities, alerts }} onOpen={handleAIOpen} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
