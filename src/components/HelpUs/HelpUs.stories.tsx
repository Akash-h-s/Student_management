import type { Meta, StoryObj } from "@storybook/react";
import HelpUs from "./HelpUs";

const meta: Meta<typeof HelpUs> = {
  title: "Features/Support/HelpUs",
  component: HelpUs,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof HelpUs>;

export const Default: Story = {};

export const SingleGuide: Story = {
  args: {
    guides: [
      {
        id: 1,
        title: "Quick Start",
        description: "Get up and running in 5 minutes.",
        steps: ["Step A", "Step B"],
        image: "https://via.placeholder.com/600x500",
        imageAlt: "Placeholder",
        bgColor: "bg-red-500",
      },
    ],
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};