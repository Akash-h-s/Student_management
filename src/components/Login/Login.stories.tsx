import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Login from './Login';
import { fireEvent } from '@storybook/test'

const meta: Meta<typeof Login> = {
  title: 'Features/Auth/Login',
  component: Login,
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthContext.Provider value={{ login: () => {} } as any}>
          <BrowserRouter>
            <Story />
          </BrowserRouter>
        </AuthContext.Provider>
      </MockedProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Login>;

export const StudentView: Story = {};

export const TeacherView: Story = {
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select');
    if (select) fireEvent.change(select, { target: { value: 'teacher' } });
  }
};

export const AdminView: Story = {
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select');
    if (select) fireEvent.change(select, { target: { value: 'admin' } });
  }
};

export const ErrorState: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    if (button) fireEvent.click(button);
  }
};