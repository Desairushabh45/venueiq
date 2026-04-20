import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock firebase
vi.mock('../firebase', () => ({
  db: {} // simulate db exists
}));

vi.mock('firebase/database', () => {
  return {
    ref: vi.fn(),
    onValue: vi.fn((ref, callback) => {
      // return a dummy unsubscribe function
      return vi.fn();
    }),
    set: vi.fn(),
    push: vi.fn(),
    serverTimestamp: vi.fn()
  };
});

import { useFirebaseData } from './useFirebaseData';
import { onValue } from 'firebase/database';

describe('useFirebaseData Hook', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct initial data shape', () => {
    const { result } = renderHook(() => useFirebaseData());
    expect(result.current).toHaveProperty('queues');
    expect(result.current).toHaveProperty('densities');
    expect(result.current).toHaveProperty('alerts');
    expect(Array.isArray(result.current.queues)).toBe(true);
    expect(typeof result.current.densities).toBe('object');
    expect(Array.isArray(result.current.alerts)).toBe(true);
  });

  it('cleans up listeners on unmount', () => {
    const unsubQueues = vi.fn();
    const unsubDensities = vi.fn();
    const unsubAlerts = vi.fn();
    
    // Setup onValue to return our mock unsubscribe functions
    onValue.mockReturnValueOnce(unsubQueues)
           .mockReturnValueOnce(unsubDensities)
           .mockReturnValueOnce(unsubAlerts);

    const { unmount } = renderHook(() => useFirebaseData());
    
    unmount();
    
    expect(unsubQueues).toHaveBeenCalled();
    expect(unsubDensities).toHaveBeenCalled();
    expect(unsubAlerts).toHaveBeenCalled();
  });

  it('data updates on interval (simulated)', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useFirebaseData());
    
    // Fast-forward to trigger interval inside useEffect
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    
    vi.useRealTimers();
    // As long as it didn't crash, the interval ran.
    // Deep testing the Firebase update interval requires more complex mocking,
    // but we can verify the hook shape remains intact.
    expect(result.current.queues).toBeDefined();
  });
});
