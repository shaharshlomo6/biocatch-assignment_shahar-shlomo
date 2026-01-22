import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

beforeEach(() => {
  // Mock BioCatch SDK object so tests won't crash
  window.cdApi = {
    setCustomerSessionId: vi.fn(),
    changeContext: vi.fn(),
  };

  // Mock fetch so we don't really call Zapier
  global.fetch = vi.fn(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ status: 'success', id: '1', request_id: '2' }),
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders Home screen', () => {
  render(<App />);
  expect(screen.getByText(/Home Screen/i)).toBeInTheDocument();
});

test('payment without login shows error message', () => {
  render(<App />);

  // Go to Payment screen (top nav button)
  fireEvent.click(screen.getByRole('button', { name: /Payment/i }));

  // Click Pay without login
  fireEvent.click(screen.getByRole('button', { name: /Pay \(getScore\)/i }));

  // Error should appear in UI
  expect(screen.getByText(/Please login first/i)).toBeInTheDocument();
});

test('login triggers init API call', async () => {
  render(<App />);

  // Go to Login screen (top nav button)
  fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

  // Click Login (init)
  fireEvent.click(screen.getByRole('button', { name: /Login \(init\)/i }));

  // fetch should be called with action=init
  expect(global.fetch).toHaveBeenCalled();
  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body.action).toBe('init');
});
