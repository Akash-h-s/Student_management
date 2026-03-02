import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

const createMockStore = () => configureStore({
  reducer: {
    auth: authReducer,
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createMockStore()}>
    <AuthProvider>{children}</AuthProvider>
  </Provider>
);

describe('AuthContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should start with loading true and no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Initial state of auth slice has loading: true
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should reflect Redux state changes (login)', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher' as const,
    };

    (jwtDecode as any).mockReturnValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher',
      exp: Date.now() / 1000 + 3600 // Valid for 1 hour
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      // The user object passed here is technically redundant as loginUser decodes from token,
      // but we pass it to match interface
      result.current.login(mockUser, 'a.b.c');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should reflect Redux state changes (logout)', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher' as const,
    };

    (jwtDecode as any).mockReturnValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher',
      exp: Date.now() / 1000 + 3600
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Login first
    act(() => {
      result.current.login(mockUser, 'a.b.c');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});