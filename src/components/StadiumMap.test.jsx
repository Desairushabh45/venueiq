import { render, screen, fireEvent } from '@testing-library/react';
import StadiumMap from './StadiumMap';
import { vi } from 'vitest';

describe('StadiumMap Component', () => {
  const mockDensities = {
    north: 20, // Green
    south: 50, // Yellow
    east: 80,  // Red
    west: 10   // Green
  };

  let mockSetIcon;
  let mockAddListener;

  beforeEach(() => {
    mockSetIcon = vi.fn();
    mockAddListener = vi.fn().mockImplementation((event, cb) => {
      if (event === 'click') {
        // Return a dummy listener object
        return { remove: vi.fn(), _trigger: cb };
      }
      return { remove: vi.fn() };
    });

    window.google = {
      maps: {
        Map: function() {
          this.setCenter = vi.fn();
          this.setZoom = vi.fn();
        },
        Marker: function() {
          this.setIcon = mockSetIcon;
          this.addListener = mockAddListener;
        },
        SymbolPath: { CIRCLE: 0 },
        event: {
          removeListener: vi.fn(),
        },
      },
    };
  });

  afterEach(() => {
    delete window.google;
    vi.clearAllMocks();
  });

  it('renders the map legend with correct zones', () => {
    render(<StadiumMap densities={mockDensities} />);
    expect(screen.getByText(/< 40% \(Low\)/i)).toBeInTheDocument();
    expect(screen.getByText(/40-70% \(Med\)/i)).toBeInTheDocument();
    expect(screen.getByText(/> 70% \(High\)/i)).toBeInTheDocument();
  });

  it('renders the map container without error message when google maps is loaded', () => {
    render(<StadiumMap densities={mockDensities} />);
    expect(screen.queryByText(/Google Maps API failed to load/i)).not.toBeInTheDocument();
  });

  it('shows green marker when density < 40%', () => {
    render(<StadiumMap densities={{ north: 20 }} />);
    // setIcon should be called with green color (#10b981)
    expect(mockSetIcon).toHaveBeenCalledWith(
      expect.objectContaining({ fillColor: '#10b981' })
    );
  });

  it('shows yellow marker when density is 40-70%', () => {
    render(<StadiumMap densities={{ south: 50 }} />);
    // setIcon should be called with yellow color (#f59e0b)
    expect(mockSetIcon).toHaveBeenCalledWith(
      expect.objectContaining({ fillColor: '#f59e0b' })
    );
  });

  it('shows red marker when density > 70%', () => {
    render(<StadiumMap densities={{ east: 80 }} />);
    // setIcon should be called with red color (#ef4444)
    expect(mockSetIcon).toHaveBeenCalledWith(
      expect.objectContaining({ fillColor: '#ef4444' })
    );
  });

  it('calls onZoneClick when a zone marker is clicked', () => {
    const onZoneClickMock = vi.fn();
    render(<StadiumMap densities={mockDensities} onZoneClick={onZoneClickMock} />);
    
    // Simulate click on the first marker created
    const clickHandler = mockAddListener.mock.calls.find(call => call[0] === 'click')[1];
    clickHandler(); // trigger click
    
    expect(onZoneClickMock).toHaveBeenCalled();
  });
});
