import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof ProtectedRoute> = {
  title: 'Authentication/ProtectedRoute',
  component: ProtectedRoute,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const Template = (authState: any, roles?: string[]) => (
  <Provider store={createMockStore(authState)}>
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div className="p-4 bg-red-100 border border-red-400 rounded">Redirected to Login Page</div>} />
        <Route path="/admin/dashboard" element={<div className="p-4 bg-blue-100 border border-blue-400 rounded">Redirected to Admin Dashboard</div>} />
        <Route path="/teacher/dashboard" element={<div className="p-4 bg-purple-100 border border-purple-400 rounded">Redirected to Teacher Dashboard</div>} />
        <Route path="/protected" element={
          <ProtectedRoute allowedRoles={roles}>
            <div className="p-4 bg-green-100 border-2 border-green-500 rounded shadow-md">
              <h3 className="font-bold text-green-800">✅ ACCESS GRANTED</h3>
              <p className="text-green-700">Protected Content is Visible</p>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  </Provider>
);

export const Loading: StoryObj = {
  render: () => Template({ loading: true, user: null }),
};

export const AccessDenied_NoUser: StoryObj = {
  render: () => Template({ loading: false, user: null }),
};

export const AccessDenied_WrongRole: StoryObj = {
  render: () => Template({
    loading: false,
    user: { id: 1, name: 'Admin User', role: 'admin', email: 'admin@test.com' }
  }, ['teacher']),
};

export const AccessGranted_CorrectRole: StoryObj = {
  render: () => Template({
    loading: false,
    user: { id: 1, name: 'Teacher User', role: 'teacher', email: 'teacher@test.com' }
  }, ['teacher']),
};