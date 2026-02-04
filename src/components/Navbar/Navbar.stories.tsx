import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  decorators: [
    (Story) => (
      /* If this error persists, delete the <MemoryRouter> lines below */
      <MemoryRouter>
        <div className="min-h-[300px] bg-gray-50">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Helper to provide the context value
const MockAuth = ({ user }: { user: any }) => (
  <AuthContext.Provider value={{
    user,
    loading: false,
    login: () => {},
    logout: () => alert("Logging out!"),
    isAuthenticated: !!user
  }}>
    <Navbar />
  </AuthContext.Provider>
);

export const Guest: Story = {
  render: () => <MockAuth user={null} />,
};

export const Admin: Story = {
  render: () => <MockAuth user={{ id: 1, name: 'Admin User', role: 'admin', email: 'admin@edu.com' }} />,
};

export const Teacher: Story = {
  render: () => <MockAuth user={{ id: 2, name: 'Mr. Thompson', role: 'teacher', email: 'teacher@edu.com' }} />,
};

export const Parent: Story = {
  render: () => <MockAuth user={{ id: 3, name: 'Jane Parent', role: 'parent', email: 'parent@edu.com' }} />,
};