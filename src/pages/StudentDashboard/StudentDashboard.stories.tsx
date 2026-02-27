import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import StudentDashboard from './StudentDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof StudentDashboard> = {
  title: 'Pages/Dashboards/Student',
  component: StudentDashboard,
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Provider store={createMockStore({
      user: { id: 1, name: 'Alex Student', role: 'student', email: 'alex@edu.com' },
      isAuthenticated: true
    })}>
      <MockedProvider mocks={[]} addTypename={false}>
        <StudentDashboard />
      </MockedProvider>
    </Provider>
  ),
};