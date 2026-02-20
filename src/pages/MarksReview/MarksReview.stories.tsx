import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import authReducer from '../../store/slices/authSlice';
import MarksReview from './MarksReview';
import { MemoryRouter } from 'react-router-dom';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta = {
  title: 'Pages/MarksReview',
  component: MarksReview,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MarksReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <Provider store={createMockStore({
          user: { id: 1, name: 'Teacher User', role: 'teacher' },
          isAuthenticated: true,
          loading: false
        })}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    )
  ]
};
