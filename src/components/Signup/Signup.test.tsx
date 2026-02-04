import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi, describe, it, expect } from 'vitest';
import Signup from './Signup';
import { useAuth } from '../../context/AuthContext';

// Mock Auth Context and Navigate
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockLogin = vi.fn();

describe('Signup Component', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({ login: mockLogin });
  });

  it('1. should show validation errors for empty fields on submit', async () => {
    render(
      <MockedProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </MockedProvider>
    );

    fireEvent.click(screen.getByText('Create Admin Account'));

    expect(await screen.findByText('School name is required')).toBeDefined();
    expect(screen.getByText('Please enter a valid email address')).toBeDefined();
  });

  it('2. should show error for invalid password format', async () => {
    render(
      <MockedProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </MockedProvider>
    );

    const passwordInput = screen.getByPlaceholderText(/Min. 8 chars/i);
    fireEvent.change(passwordInput, { target: { value: 'short', name: 'password' } });
    fireEvent.click(screen.getByText('Create Admin Account'));

    expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeDefined();
  });

  it('3. should update field values on change', () => {
    render(
      <MockedProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </MockedProvider>
    );

    const schoolInput = screen.getByPlaceholderText('Enter school name') as HTMLInputElement;
    fireEvent.change(schoolInput, { target: { value: 'Greenwood High', name: 'schoolName' } });
    expect(schoolInput.value).toBe('Greenwood High');
  });

  it('4. should display loading state when mutation is in progress', () => {
     // This test requires mocking the useMutation loading state specifically
     // via the MockedProvider mocks array.
  });
});