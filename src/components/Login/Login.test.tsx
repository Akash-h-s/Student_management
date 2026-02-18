import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

// Mock Auth Context
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
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


describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful student login and navigation', async () => {
    // Mock successful login call
    (authService.login as any).mockResolvedValue({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 101,
        name: 'John Doe',
        email: 'john@school.com',
        role: 'student',
      },
    });

    const { container } = render(
      <MockedProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    // 1. Find text inputs by their order in the DOM (Identifier, then Name)
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: 'STU123' } });
    fireEvent.change(textInputs[1], { target: { value: 'John Doe' } });

    // 2. Click submit button (Verify & Enter for student)
    fireEvent.click(screen.getByText('Verify & Enter'));

    await waitFor(() => {
      // Check for authService call with correct params
      expect(authService.login).toHaveBeenCalledWith({
        role: 'student',
        identifier: 'STU123',
        studentName: 'John Doe',
        password: undefined,
      });

      // Check for login context call
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ id: 101, role: 'student' }),
        'mock-jwt-token'
      );

      // Check navigation
      expect(mockedNavigate).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('shows error if admin is not found (login failure)', async () => {
    // Mock failed login
    (authService.login as any).mockRejectedValue(new Error('Admin not found with provided credentials'));

    const { container } = render(
      <MockedProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    // 1. Switch Role to Admin
    // Click the CustomSelect trigger button
    const selectTrigger = screen.getByText('Student');
    fireEvent.click(selectTrigger);

    // Click the Admin option
    const adminOption = screen.getByText('Admin');
    fireEvent.click(adminOption);

    // 2. Find Email input (type="email") and Password input (type="password")
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    if (emailInput) fireEvent.change(emailInput, { target: { value: 'admin@school.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 3. Submit (Sign In for admin)
    fireEvent.click(screen.getByText('Sign In'));


  });
});
