import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';

const meta: Meta<typeof StudentDashboard> = {
  title: 'Pages/Dashboards/Student',
  component: StudentDashboard,
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <MockedProvider mocks={[]} addTypename={false}>
      <AuthContext.Provider value={{ user: { name: 'Alex Student', id: 1 } } as any}>
        <StudentDashboard />
      </AuthContext.Provider>
    </MockedProvider>
  ),
};