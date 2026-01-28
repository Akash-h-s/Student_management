import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import Login from '../Login/Login';

const meta = {
  title: 'Pages/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// ==================== DEFAULT STATES ====================

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default login page showing student login form',
      },
    },
  },
};

export const StudentView: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Student login requires admission number and full name (no password)',
      },
    },
  },
};

export const TeacherView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const roleSelect = canvas.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'teacher');
  },
  parameters: {
    docs: {
      description: {
        story: 'Teacher login requires email and password',
      },
    },
  },
};

export const ParentView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const roleSelect = canvas.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'parent');
  },
  parameters: {
    docs: {
      description: {
        story: 'Parent login requires email and password',
      },
    },
  },
};

export const AdminView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const roleSelect = canvas.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'admin');
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin login requires email and password',
      },
    },
  },
};

// ==================== INTERACTION TESTS ====================





export const ParentLoginFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const roleSelect = canvas.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'parent');
    
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'parent@email.com');
    
    const passwordInput = canvas.getByLabelText(/parent password/i);
    await userEvent.type(passwordInput, 'ParentPass123');
    
    expect(emailInput).toHaveValue('parent@email.com');
    expect(passwordInput).toHaveValue('ParentPass123');
  },
};

export const AdminLoginFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const roleSelect = canvas.getByRole('combobox');
    await userEvent.selectOptions(roleSelect, 'admin');
    
    const emailInput = canvas.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'admin@school.com');
    
    const passwordInput = canvas.getByLabelText(/admin password/i);
    await userEvent.type(passwordInput, 'AdminSecure123');
    
    expect(emailInput).toHaveValue('admin@school.com');
    expect(passwordInput).toHaveValue('AdminSecure123');
  },
};

