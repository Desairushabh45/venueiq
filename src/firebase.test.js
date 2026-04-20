import { vi, describe, it, expect } from 'vitest';

// We have to mock firebase/app before importing our file
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' }))
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn()
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({}))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: function() {
    this.setCustomParameters = vi.fn();
  }
}));

describe('firebase.js', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initializes Firebase correctly', async () => {
    const { initializeApp } = await import('firebase/app');
    const { app } = await import('./firebase');
    
    expect(initializeApp).toHaveBeenCalled();
    expect(app).toBeDefined();
  });

  it('Analytics is active when window is defined', async () => {
    const { getAnalytics } = await import('firebase/analytics');
    const { analytics } = await import('./firebase');
    
    expect(getAnalytics).toHaveBeenCalled();
    expect(analytics).toBeDefined();
  });
});
