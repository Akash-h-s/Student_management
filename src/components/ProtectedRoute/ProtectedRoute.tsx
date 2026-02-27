import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    // Show a loading spinner or nothing while checking session
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If there is no user in the context state, they are not authenticated.
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: Role ${user.role} not allowed, redirecting to dashboard`);

    // Default dashboard routes based on roles
    let redirectPath = '/login';
    if (user.role === 'admin') redirectPath = '/admin/dashboard';
    else if (user.role === 'teacher') redirectPath = '/teacher/dashboard';
    else if (user.role === 'student') redirectPath = '/student/dashboard';
    else if (user.role === 'parent') redirectPath = '/parent/dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;