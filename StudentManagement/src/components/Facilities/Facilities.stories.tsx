import type { Meta, StoryObj } from "@storybook/react";
import Facilities from "./Facilities";

// This is the "Meta" configuration Storybook is complaining about
const meta = {
  title: "Components/Facilities",
  component: Facilities,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Facilities>;

export default meta; // <--- THIS MUST BE HERE

type Story = StoryObj<typeof meta>;

export const Laptop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};