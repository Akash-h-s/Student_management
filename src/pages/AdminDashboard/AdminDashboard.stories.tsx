// src/components/AdminDashboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import AdminDashboard from './AdminDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof AdminDashboard> = {
  title: 'Pages/Admin/Dashboard',
  component: AdminDashboard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        {Story()}
      </MemoryRouter>
    ),
  ],
};

export default meta;

export const Default: StoryObj = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { name: 'Alexander Pierce', role: 'admin' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};

export const MobileView: StoryObj = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { name: 'Admin User', role: 'admin' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};