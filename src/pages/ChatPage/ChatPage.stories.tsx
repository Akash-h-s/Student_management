// src/components/ChatSystem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import ChatSystem from '../ChatPage/ChatPage';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof ChatSystem> = {
  title: 'Features/Communication/ChatSystem',
  component: ChatSystem,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        {Story()}
      </MockedProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatSystem>;

export const TeacherView: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 1, name: 'Prof. McGonagall', role: 'teacher' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};

export const ParentView: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        user: { id: 2, name: 'Mrs. Weasley', role: 'parent' },
        isAuthenticated: true,
        loading: false
      })}>
        {Story()}
      </Provider>
    )
  ]
};