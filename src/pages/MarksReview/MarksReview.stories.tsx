import type { Meta, StoryObj } from '@storybook/react';
import MarksReview from './MarksReview';

const meta = {
  title: 'Pages/MarksReview',
  component: MarksReview,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MarksReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithData: Story = {
  parameters: {
    mockData: true,
  },
};
