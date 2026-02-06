import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Signup from './Signup';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

// Mock Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    signup: vi.fn(),
  },
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockLogin = vi.fn();

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // Use findByText to wait for async validation messages
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

  it('4. should call authService.signup and redirect on success', async () => {
    // Mock successful signup
    (authService.signup as any).mockResolvedValue({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        name: 'Test School',
        email: 'admin@school.com',
        role: 'admin',
      },
    });

    render(
      <MockedProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </MockedProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Enter school name'), { target: { value: 'Test School', name: 'schoolName' } });
    fireEvent.change(screen.getByPlaceholderText('admin@school.com'), { target: { value: 'admin@school.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText(/Min. 8 chars/i), { target: { value: 'password123', name: 'password' } });
    fireEvent.change(screen.getByPlaceholderText('Enter phone number'), { target: { value: '1234567890', name: 'phone' } });

    // Submit
    fireEvent.click(screen.getByText('Create Admin Account'));

    await waitFor(() => {
      expect(authService.signup).toHaveBeenCalledWith({
        schoolName: 'Test School',
        email: 'admin@school.com',
        password: 'password123',
        phone: '1234567890',
      });
      // Check for login call
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, name: 'Test School', email: 'admin@school.com', role: 'admin' },
        'mock-jwt-token'
      );
      // Check redirect
      expect(mockedNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });


});