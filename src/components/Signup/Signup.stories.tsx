// src/components/Signup.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import Signup from './Signup';

const meta: Meta<typeof Signup> = {
  title: 'Pages/Auth/Signup',
  component: Signup,
  decorators: [
    (Story) => (
      <MockedProvider>
        <BrowserRouter>
          <AuthContext.Provider value={{ login: () => {} } as any}>
            <Story />
          </AuthContext.Provider>
        </BrowserRouter>
      </MockedProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Signup>;

export const Default: Story = {};

export const LoadingState: Story = {
  // Mocking the loading state requires injecting a custom hook mock 
  // or using Storybook's play function to trigger a submit
};