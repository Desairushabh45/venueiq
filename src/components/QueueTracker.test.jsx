import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QueueTracker from './QueueTracker';

describe('QueueTracker Component', () => {
  it('renders queue sections correctly', () => {
    const mockQueues = [
      { id: 'g1', name: 'Gate A', type: 'gate', waitTime: 10 }
    ];
    render(<QueueTracker queues={mockQueues} />);
    expect(screen.getByText('Entry Gates')).toBeInTheDocument();
    expect(screen.getByText('Gate A')).toBeInTheDocument();
  });
});
