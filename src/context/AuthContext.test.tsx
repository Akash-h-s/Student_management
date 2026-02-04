import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should start with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher' as const,
    };

    act(() => {
      result.current.login(mockUser, 'fake-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'teacher' as const,
    };

    act(() => {
      result.current.login(mockUser, 'fake-token');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});