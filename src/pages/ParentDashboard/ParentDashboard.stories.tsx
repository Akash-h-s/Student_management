import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import ParentDashboard from './ParentDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof ParentDashboard> = {
  title: 'Pages/Dashboards/Parent',
  component: ParentDashboard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ParentDashboard>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 3, name: 'Sarah Parent', role: 'parent', email: 'sarah@edu.com' },
        isAuthenticated: true,
        loading: false
      })}>
        <Story />
      </Provider>
    )
  ]
};