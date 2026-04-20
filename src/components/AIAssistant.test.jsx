import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAssistant from './AIAssistant';
import { vi } from 'vitest';

const mockContextData = {
  queues: [{ name: 'Gate A', waitTime: 5, type: 'gate' }],
  densities: { north: 30 },
  alerts: []
};

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('AIAssistant Component', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    import.meta.env.VITE_GEMINI_API_KEY = 'AIza-test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders chat input', () => {
    render(<AIAssistant contextData={mockContextData} />);
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
    expect(screen.getByPlaceholderText(/Ask about the venue.../i)).toBeInTheDocument();
  });

  it('shows error message when API key is missing', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = ''; // Simulate missing key
    render(<AIAssistant contextData={mockContextData} />);
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
    
    const input = screen.getByPlaceholderText(/Ask about the venue.../i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/AI key not configured/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while waiting for response', async () => {
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AIAssistant contextData={mockContextData} />);
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
    
    const input = screen.getByPlaceholderText(/Ask about the venue.../i);
    fireEvent.change(input, { target: { value: 'How busy?' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/i }));
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('renders response after API call', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'It is very quiet today.' }] } }]
      })
    });
    
    render(<AIAssistant contextData={mockContextData} />);
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
    
    const input = screen.getByPlaceholderText(/Ask about the venue.../i);
    fireEvent.change(input, { target: { value: 'How busy?' } });
    fireEvent.click(screen.getByRole('button', { name: /Send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText('It is very quiet today.')).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('message is sent on button click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Response' }] } }]
      })
    });
    
    render(<AIAssistant contextData={mockContextData} />);
    fireEvent.click(screen.getByLabelText(/Open AI Assistant/i));
    
    const input = screen.getByPlaceholderText(/Ask about the venue.../i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});
