import type { Meta, StoryObj } from "@storybook/react";
import AboutUs from "./AboutUs";

const meta: Meta<typeof AboutUs> = {
  title: "Pages/AboutUs",
  component: AboutUs,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof AboutUs>;

export const Default: Story = {};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};