import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary Component', () => {
  const originalError = console.error;

  beforeAll(() => {
    console.error = vi.fn(); // Suppress intentional error logs
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Safe Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws an error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
