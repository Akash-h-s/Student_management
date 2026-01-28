// src/components/AdminDashboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const meta: Meta<typeof AdminDashboard> = {
  title: 'Pages/Admin/Dashboard',
  component: AdminDashboard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <AuthContext.Provider value={{ 
      user: { name: 'Alexander Pierce', role: 'admin' },
      loading: false,
      isAuthenticated: true 
    } as any}>
      <AdminDashboard />
    </AuthContext.Provider>
  )
};

export const MobileView: StoryObj = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <AuthContext.Provider value={{ 
      user: { name: 'Admin User', role: 'admin' },
      loading: false,
      isAuthenticated: true 
    } as any}>
      <AdminDashboard />
    </AuthContext.Provider>
  )
};