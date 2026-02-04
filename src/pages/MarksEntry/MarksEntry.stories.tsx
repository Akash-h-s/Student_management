// src/components/MarksEntrySystem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AuthContext } from '../../context/AuthContext';
import MarksEntrySystem from '../MarksEntry/MarksEntry';

const meta: Meta<typeof MarksEntrySystem> = {
  title: 'Pages/Teacher/MarksEntry',
  component: MarksEntrySystem,
};

export default meta;

export const DefaultView: StoryObj = {
  render: () => (
    <AuthContext.Provider value={{ user: { id: 101, name: 'Sarah Wilson' }, loading: false } as any}>
      <MarksEntrySystem />
    </AuthContext.Provider>
  )
};

export const AuthenticatedWithData: StoryObj = {
  render: () => (
    <AuthContext.Provider value={{ user: { id: 101, name: 'Sarah Wilson' }, loading: false } as any}>
       {/* Note: This would usually require MSW to mock the fetch response */}
      <MarksEntrySystem />
    </AuthContext.Provider>
  )
};