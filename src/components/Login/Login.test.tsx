import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import Login from './Login';
import { authService } from '../../services/authService';

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

// Mock jwt-decode for integration test
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token) => {
    if (token === 'mock-jwt-token.part2.part3') {
      return {
        id: 101,
        name: 'John Doe',
        email: 'john@school.com',
        role: 'student',
        exp: Date.now() / 1000 + 3600
      };
    }
    throw new Error('Invalid token');
  }),
}));

const createMockStore = () => configureStore({
  reducer: {
    auth: authReducer,
  },
});

describe('Login Component', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createMockStore();
    // Spy on dispatch if needed
    store.dispatch = vi.fn(store.dispatch);
  });

  const renderLogin = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );
  };

  it('handles successful student login and navigation', async () => {
    (authService.login as any).mockResolvedValue({
      success: true,
      token: 'mock-jwt-token.part2.part3',
      user: {
        id: 101,
        name: 'John Doe',
        email: 'john@school.com',
        role: 'student',
      },
    });

    renderLogin();

    const roleSelect = screen.getByText('Student'); // Trigger or default
    expect(roleSelect).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    // Admission Number (first)
    fireEvent.change(inputs[0], { target: { value: 'STU123' } });
    // Student Name (second)
    fireEvent.change(inputs[1], { target: { value: 'John Doe' } });

    const submitBtn = screen.getByText('Verify & Enter');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        role: 'student',
        identifier: 'STU123',
        studentName: 'John Doe',
        password: undefined,
      });

      // Check if store state updated
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('John Doe');

      expect(mockedNavigate).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('shows error on login failure', async () => {
    (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));
    renderLogin();

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'STU123' } });
    fireEvent.change(inputs[1], { target: { value: 'John Doe' } });

    const submitBtn = screen.getByText('Verify & Enter');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Login failed: Invalid credentials/i)).toBeInTheDocument();
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
