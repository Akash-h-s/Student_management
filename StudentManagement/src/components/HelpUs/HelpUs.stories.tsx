import type { Meta, StoryObj } from '@storybook/react';
import HelpUs from './HelpUs';

const meta: Meta<typeof HelpUs> = {
  title: 'Components/HelpUs',
  component: HelpUs,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default view (Responsive)
export const Default: Story = {};

// Mobile view - Verify that images and text stack vertically
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet/Laptop view - Verify the alternating zigzag layout
export const Laptop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'laptop',
    },
  },
};