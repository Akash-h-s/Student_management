import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  // 1. If still initializing auth, show nothing (prevents redirect loop)
  if (loading) {
    return null; 
  }

  // 2. Not authenticated - redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are logged in but on the wrong page, send to their own dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // 4. Authorized
  return <>{children}</>;
};

export default ProtectedRoute;