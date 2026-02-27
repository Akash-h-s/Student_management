import React from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, logoutUser } from '../store/slices/authSlice';
import type { User as ReduxUser, Role as ReduxRole } from '../store/slices/authSlice';

export type Role = ReduxRole;
export type User = ReduxUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// This provider bridges Redux state to the legacy AuthContext
// allowing existing components and tests that rely on AuthContext to work
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const login = (_userData: User, token: string) => {
    dispatch(loginUser(token));
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// The hook now consumes the Context, which is populated by Redux in the app (via AuthProvider),
// or by mocks in legacy tests.
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};