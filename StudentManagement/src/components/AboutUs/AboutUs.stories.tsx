// src/components/AboutUs/AboutUs.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import AboutUs from './AboutUs';

// Meta configuration - THIS IS REQUIRED!
const meta: Meta<typeof AboutUs> = {
  title: 'Components/AboutUs',
  component: AboutUs,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

// THIS LINE IS CRITICAL - Must export default!
export default meta;

// Type for stories
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};

// Mobile view
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Tablet view
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// Desktop view
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};