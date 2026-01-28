// src/components/ChatSystem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AuthContext } from '../../context/AuthContext';
import ChatSystem from '../ChatPage/ChatPage';

const meta: Meta<typeof ChatSystem> = {
  title: 'Features/Communication/ChatSystem',
  component: ChatSystem,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ChatSystem>;

const MockProvider = ({ children, role }: any) => (
  <AuthContext.Provider value={{ 
    user: { id: 1, name: role === 'teacher' ? 'Prof. McGonagall' : 'Mrs. Weasley', role },
    loading: false 
  } as any}>
    {children}
  </AuthContext.Provider>
);

export const TeacherViewEmpty: Story = {
  render: () => (
    <MockProvider role="teacher">
      <ChatSystem />
    </MockProvider>
  ),
};

export const ParentViewEmpty: Story = {
  render: () => (
    <MockProvider role="parent">
      <ChatSystem />
    </MockProvider>
  ),
};