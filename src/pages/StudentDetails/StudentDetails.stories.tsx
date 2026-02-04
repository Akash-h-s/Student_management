// src/pages/StudentDetails/StudentDetails.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AuthContext } from '../../context/AuthContext';
import StudentDetails from './StudentDetails';

const meta: Meta<typeof StudentDetails> = {
  title: 'Pages/Parent/StudentDetails', // Ensure this title is unique
  component: StudentDetails,
};

// This default export is required by Storybook CSF
export default meta; 

type Story = StoryObj<typeof StudentDetails>;

export const Default: Story = {
  render: () => (
    <AuthContext.Provider value={{ 
      user: { id: '1', name: 'Parent User', role: 'parent' },
      loading: false 
    } as any}>
      <StudentDetails />
    </AuthContext.Provider>
  )
};