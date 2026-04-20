import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QueueTracker from './QueueTracker';

describe('QueueTracker Component', () => {
  it('renders all queue items correctly', () => {
    const mockQueues = [
      { id: 'g1', name: 'Gate A', type: 'gate', waitTime: 10 },
      { id: 'f1', name: 'Food Stand', type: 'food', waitTime: 5 },
      { id: 't1', name: 'Toilets', type: 'toilet', waitTime: 20 }
    ];
    render(<QueueTracker queues={mockQueues} />);
    
    expect(screen.getByText('Entry Gates')).toBeInTheDocument();
    expect(screen.getByText('Gate A')).toBeInTheDocument();
    expect(screen.getByText('Food Stand')).toBeInTheDocument();
    expect(screen.getByText('Toilets')).toBeInTheDocument();
  });

  it('green bar shows for wait < 15 min', () => {
    const mockQueues = [{ id: 'g1', name: 'Gate A', type: 'gate', waitTime: 5 }];
    render(<QueueTracker queues={mockQueues} />);
    
    const waitTimeElement = screen.getByText('5 min');
    // We check if style color maps to the expected status low color in inline styles
    expect(waitTimeElement).toHaveStyle({ color: 'var(--status-low)' });
  });

  it('red bar shows for wait > 30 min (or high wait)', () => {
    const mockQueues = [{ id: 'g1', name: 'Gate B', type: 'gate', waitTime: 35 }];
    render(<QueueTracker queues={mockQueues} />);
    
    const waitTimeElement = screen.getByText('35 min');
    // If > 20 it's status-high based on component logic
    expect(waitTimeElement).toHaveStyle({ color: 'var(--status-high)' });
  });

  it('wait times update when new props are passed', () => {
    const mockQueues = [{ id: 'g1', name: 'Gate A', type: 'gate', waitTime: 10 }];
    const { rerender } = render(<QueueTracker queues={mockQueues} />);
    expect(screen.getByText('10 min')).toBeInTheDocument();

    const updatedQueues = [{ id: 'g1', name: 'Gate A', type: 'gate', waitTime: 15 }];
    rerender(<QueueTracker queues={updatedQueues} />);
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });
});
