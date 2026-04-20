import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AlertSystem from './AlertSystem';
import { Info, AlertTriangle } from 'lucide-react';

describe('AlertSystem Component', () => {
  it('renders empty state when no alerts', () => {
    render(<AlertSystem alerts={[]} />);
    expect(screen.getByText('No active alerts')).toBeInTheDocument();
  });

  it('renders alerts correctly', () => {
    const mockAlerts = [
      { id: 1, type: 'announcement', title: 'Test Alert', message: 'This is a test', time: 'Now', icon: Info }
    ];
    render(<AlertSystem alerts={mockAlerts} />);
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
    expect(screen.getByText('This is a test')).toBeInTheDocument();
  });

  it('emergency alert shows in red (has emergency class)', () => {
    const mockAlerts = [
      { id: 1, type: 'emergency', title: 'Emergency Alert', message: 'Run!', time: 'Now', icon: AlertTriangle }
    ];
    render(<AlertSystem alerts={mockAlerts} />);
    const alertItem = screen.getByText('Emergency Alert').closest('.alert-item');
    expect(alertItem).toHaveClass('emergency');
  });

  it('new alert can be posted by admin', async () => {
    const onPostAlertMock = vi.fn().mockResolvedValue();
    render(<AlertSystem alerts={[]} isAdmin={true} onPostAlert={onPostAlertMock} />);
    
    const titleInput = screen.getByPlaceholderText('Alert title…');
    const msgInput = screen.getByPlaceholderText('Alert message…');
    const submitBtn = screen.getByRole('button', { name: /Post Alert/i });

    fireEvent.change(titleInput, { target: { value: 'New Test Alert' } });
    fireEvent.change(msgInput, { target: { value: 'This is a test message.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onPostAlertMock).toHaveBeenCalledWith('New Test Alert', 'This is a test message.', 'announcement');
    });
  });

  it('does not show post form to non-admins', () => {
    render(<AlertSystem alerts={[]} isAdmin={false} />);
    expect(screen.queryByPlaceholderText('Alert title…')).not.toBeInTheDocument();
  });
});
