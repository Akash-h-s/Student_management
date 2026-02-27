import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import Login from './Login';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

const meta: Meta<typeof Login> = {
  title: 'Features/Auth/Login',
  component: Login,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <BrowserRouter>
          {Story()}
        </BrowserRouter>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Login>;

export const StudentView: Story = {};

export const TeacherView: Story = {
  // Using args to set initial state is hard with controlled components inside standard stories without extra addon.
  // But we can just rely on user interaction or mock state if we exposed props.
  // Since Login handles its own state, we just render it.
};

export const AdminView: Story = {};