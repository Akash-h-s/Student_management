// src/components/ProtectedRoute.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const meta: Meta<typeof ProtectedRoute> = {
  title: 'Authentication/ProtectedRoute',
  component: ProtectedRoute,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div className="p-4 bg-red-100">Redirected to Login</div>} />
          <Route path="/admin/dashboard" element={<div className="p-4 bg-blue-100">Admin Dashboard</div>} />
          <Route path="/protected" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;

const Template = (user: any, roles?: string[]) => (
  <AuthContext.Provider value={{ 
    user, 
    loading: false, 
    logout: () => {}, 
    login: () => {},
    isAuthenticated: !!user 
  }}>
    <ProtectedRoute allowedRoles={roles}>
      <div className="p-4 bg-green-100 border-2 border-green-500">
        ✅ ACCESS GRANTED: Protected Content Visible
      </div>
    </ProtectedRoute>
  </AuthContext.Provider>
);

export const AccessDenied_NoUser: StoryObj = {
  render: () => Template(null),
};

export const AccessDenied_WrongRole: StoryObj = {
  render: () => Template({ role: 'admin' }, ['teacher']),
};

export const AccessGranted: StoryObj = {
  render: () => Template({ role: 'teacher' }, ['teacher']),
};