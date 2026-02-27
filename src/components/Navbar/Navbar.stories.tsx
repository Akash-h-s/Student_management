import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import Navbar from './Navbar';

// Helper to create a store with initial state
const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="min-h-[300px] bg-gray-50">
          {Story()}
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Guest: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({ user: null, isAuthenticated: false, loading: false })}>
        {Story()}
      </Provider>
    )
  ]
};

export const Admin: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 1, name: 'Admin User', role: 'admin', email: 'admin@edu.com' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};

export const Teacher: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 2, name: 'Mr. Thompson', role: 'teacher', email: 'teacher@edu.com' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};

export const Parent: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 3, name: 'Jane Parent', role: 'parent', email: 'parent@edu.com' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};