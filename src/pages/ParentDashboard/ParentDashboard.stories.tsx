import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ParentDashboard from './ParentDashboard';

const meta: Meta<typeof ParentDashboard> = {
  title: 'Pages/Dashboards/Parent',
  component: ParentDashboard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <AuthContext.Provider value={{ user: { name: 'Sarah Parent', role: 'parent' } } as any}>
      <ParentDashboard />
    </AuthContext.Provider>
  ),
};