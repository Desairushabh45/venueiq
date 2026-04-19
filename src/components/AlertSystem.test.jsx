import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AlertSystem from './AlertSystem';
import { Info } from 'lucide-react';

describe('AlertSystem Component', () => {
  it('renders "No active alerts" when empty array is passed', () => {
    render(<AlertSystem alerts={[]} />);
    expect(screen.getByText('No active alerts')).toBeInTheDocument();
  });

  it('renders alerts correctly', () => {
    const mockAlerts = [
      { id: 1, type: 'emergency', title: 'Test Alert', message: 'This is a test', time: 'Now', icon: Info }
    ];
    render(<AlertSystem alerts={mockAlerts} />);
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a test')).toBeInTheDocument();
  });
});
