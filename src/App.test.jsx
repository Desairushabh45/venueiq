import { render, screen } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

vi.mock('./firebase', () => ({
  app: {},
  analytics: {},
  db: {},
  auth: { currentUser: null },
  provider: {},
  logEvent: vi.fn(),
}));

vi.mock('./hooks/useFirebaseData', () => ({
  useFirebaseData: () => ({
    queues: [],
    densities: {},
    alerts: [],
    postAlert: vi.fn(),
  })
}));

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ isAdmin: false, user: null, signIn: vi.fn(), signOut: vi.fn() })
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('VenueIQ')).toBeInTheDocument();
  });

  it('renders all 4 main components', async () => {
    render(<App />);
    // QueueTracker
    expect(await screen.findByText(/Queue Tracker/i)).toBeInTheDocument();
    // StadiumMap
    expect(await screen.findByLabelText(/Live Crowd Heatmap/i)).toBeInTheDocument();
    // AlertSystem
    expect(await screen.findByText(/Live Alerts/i)).toBeInTheDocument();
    // AIAssistant toggle button
    expect(await screen.findByLabelText(/Open AI Assistant/i)).toBeInTheDocument();
  });

  it('renders Google Auth button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });
});
