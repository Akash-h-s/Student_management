// src/components/Need.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Need from './Need';

const meta: Meta<typeof Need> = {
  title: 'Components/Landing/NeedSection',
  component: Need,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Need>;

export const Default: Story = {};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};