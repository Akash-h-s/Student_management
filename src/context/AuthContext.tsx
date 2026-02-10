import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

export type Role = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface JWTPayload {
  id?: number;
  name?: string;
  email?: string;
  sub?: string;
  role?: Role;
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-user-id'?: string;
    'x-hasura-default-role'?: string;
    'x-hasura-user-name'?: string;
    'x-hasura-user-email'?: string;
  };
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check if a path is public
const isPathPublic = (path: string) => {
  const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
  return normalized === '/' || normalized === '/login' || normalized === '/signup';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This ref is our "Source of Truth" in memory for the token
  const memoirToken = useRef<string | null>(localStorage.getItem('token'));

  const logout = useCallback(() => {
    console.warn('[AUTH] Session terminated. Clearing security context...');

    // 1. Clear Memory and Storage
    setUser(null);
    memoirToken.current = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Redirect check
    if (!isPathPublic(window.location.pathname)) {
      console.log('[AUTH] Protected route detected. Forcing redirect to /login');
      window.location.href = '/login';
    }
  }, []);

  const validateAndSetToken = useCallback((token: string) => {
    try {
      if (!token) {
        logout();
        return;
      }

      // 1. Structural check
      if (token.split('.').length !== 3) {
        throw new Error('Structural mismatch: Not a 3-part JWT');
      }

      // 2. Format check (base64)
      const parts = token.split('.');
      try {
        atob(parts[0]);
        atob(parts[1]);
      } catch {
        throw new Error('Base64 corruption detected');
      }

      // 3. Decoding check
      const decoded = jwtDecode<JWTPayload>(token);

      // 4. Expiry Check
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token Expired');
      }

      // 5. Claims check
      const claims = decoded['https://hasura.io/jwt/claims'];
      const role = (decoded.role || claims?.['x-hasura-default-role']) as Role;
      const userId = decoded.id || decoded.sub || claims?.['x-hasura-user-id'];

      if (!role || !userId) {
        throw new Error('Essential claims missing');
      }

      const userData: User = {
        id: Number(userId),
        name: decoded.name || claims?.['x-hasura-user-name'] || 'User',
        email: decoded.email || claims?.['x-hasura-user-email'] || '',
        role: role,
      };

      // Success
      setUser(userData);
      memoirToken.current = token;
      console.log(`[AUTH] Session valid for: ${userData.role}`);
    } catch (error: any) {
      console.error(`[AUTH] Tampering detected: ${error.message}`);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Stage 1: Initial Bootstrap
    const bootstrap = () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        validateAndSetToken(stored);
      }
      setLoading(false);
    };
    bootstrap();

    // Stage 2: The Tampering Guardian
    const interval = setInterval(() => {
      const liveStorageToken = localStorage.getItem('token');

      if (liveStorageToken !== memoirToken.current) {
        console.log('[AUTH] Storage change detected!');
        if (!liveStorageToken) {
          logout();
        } else {
          validateAndSetToken(liveStorageToken);
        }
      }

      if (localStorage.getItem('user')) {
        localStorage.removeItem('user');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [validateAndSetToken, logout]);

  const login = (userData: User, token: string) => {
    memoirToken.current = token;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
