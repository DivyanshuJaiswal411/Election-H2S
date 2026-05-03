import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import '@testing-library/jest-dom';

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the initial welcome message', () => {
    render(<Home />);
    expect(screen.getByText(/Hello! I am your AI Election Assistant/i)).toBeInTheDocument();
  });

  it('renders suggested prompt buttons', () => {
    render(<Home />);
    expect(screen.getByText('How do I register to vote?')).toBeInTheDocument();
    expect(screen.getByText('What are the deadlines for the next election?')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'How to vote?' } });
    expect(input.value).toBe('How to vote?');
  });

  it('submits a message and displays AI response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'AI Response Content' }),
    });

    render(<Home />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const submitBtn = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'How to vote?' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('How to vote?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('AI Response Content')).toBeInTheDocument();
    });
  });

  it('shows loading indicator during submission', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ message: 'Done' }),
      }), 100))
    );

    render(<Home />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const submitBtn = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
