import type { Meta, StoryObj } from "@storybook/react";
import { FaBeer } from "react-icons/fa";
import Facilities from "./Facilities";

const meta: Meta<typeof Facilities> = {
  title: "Features/Campus/Facilities",
  component: Facilities,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Facilities>;

export const Default: Story = {};

export const CustomData: Story = {
  args: {
    headerContent: {
      title: "Our Amenities",
      subtitle: "Explore our",
      highlightText: "world-class",
      subtitleEnd: "features",
    },
    facilities: [
      {
        id: 1,
        Icon: FaBeer,
        title: "Cafeteria",
        desc: "Healthy meals and snacks available for all students.",
        bgColor: "bg-amber-100",
        iconColor: "text-amber-600",
      },
    ],
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};