import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import TeacherDashboard from './TeacherDashboard';

const meta: Meta<typeof TeacherDashboard> = {
  title: 'Pages/Dashboards/Teacher',
  component: TeacherDashboard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <AuthContext.Provider value={{ user: { name: 'Minerva McGonagall', role: 'teacher' } } as any}>
      <TeacherDashboard />
    </AuthContext.Provider>
  ),
};