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

const isPathPublic = (path: string) => {
  const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
  return normalized === '/' || normalized === '/login' || normalized === '/signup';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  const memoirToken = useRef<string | null>(localStorage.getItem('token'));

  const logout = useCallback(() => {
    console.warn('[AUTH] Session terminated. Clearing security context...');

   
    setUser(null);
    memoirToken.current = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');

   
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

      if (token.split('.').length !== 3) {
        throw new Error('Structural mismatch: Not a 3-part JWT');
      }

    
      const parts = token.split('.');
      try {
        atob(parts[0]);
        atob(parts[1]);
      } catch {
        throw new Error('Base64 corruption detected');
      }


      const decoded = jwtDecode<JWTPayload>(token);


      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token Expired');
      }


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

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      memoirToken.current = token;
      console.log(`[AUTH] Session valid for: ${userData.role}`);
    } catch (error: any) {
      console.error(`[AUTH] Tampering detected: ${error.message}`);
      logout();
    }
  }, [logout]);

  useEffect(() => {

    const bootstrap = () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        validateAndSetToken(stored);
      } else {
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    bootstrap();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          logout();
        } else {
          validateAndSetToken(e.newValue);
        }
      } else if (e.key === 'user') {
        const liveToken = localStorage.getItem('token');
        if (!liveToken) {
          logout();
          return;
        }
        if (e.newValue !== e.oldValue) {
          console.warn('[AUTH] Critical user data change detected in storage. Forcing logout.');
          logout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [validateAndSetToken, logout]);

  const login = (userData: User, token: string) => {
    memoirToken.current = token;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
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