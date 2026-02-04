// src/pages/AdminUpload/AdminUpload.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminUpload from './AdminUpload';

// 1. Define the metadata
const meta: Meta<typeof AdminUpload> = {
  title: 'Pages/Admin/Upload', // Must be unique from AdminDashboard
  component: AdminUpload,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

// 2. THIS IS THE MISSING PART CAUSING THE ERROR
export default meta; 

type Story = StoryObj<typeof AdminUpload>;

export const Default: Story = {
  render: () => (
    <AuthContext.Provider value={{ 
      user: { name: 'Admin User', role: 'admin' },
      loading: false,
      isAuthenticated: true 
    } as any}>
      <AdminUpload />
    </AuthContext.Provider>
  )
};