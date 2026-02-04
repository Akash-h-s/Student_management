import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutUs from "./AboutUs";

describe("AboutUs Component", () => {
  it("renders the main heading and intro paragraphs", () => {
    render(<AboutUs />);
    
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(
      screen.getByText(/Student Management System is designed to simplify/i)
    ).toBeInTheDocument();
  });

  it("renders all four feature cards", () => {
    render(<AboutUs />);
    
    expect(screen.getByText("Student Support")).toBeInTheDocument();
    expect(screen.getByText("Teacher Management")).toBeInTheDocument();
    expect(screen.getByText("Parent Access")).toBeInTheDocument();
    expect(screen.getByText("Smart Analytics")).toBeInTheDocument();
  });

  it("renders info sections with correct images", () => {
    render(<AboutUs />);
    
    const images = screen.getAllByRole("img");
    // We expect 2 images from INFO_SECTIONS
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("alt", "Education illustration");
    expect(images[1]).toHaveAttribute("alt", "Student illustration");
  });

  it("applies correct order for left/right image positioning", () => {
    const { container } = render(<AboutUs />);
    
    // Select the first ImageTextSection (Our Mission - Left position)
    const sections = container.querySelectorAll(".grid-cols-2");
    
    // Section 0 is the Intro + Features
    // Section 1 is "Our Mission" (Image Left)
    const missionSection = sections[1];
    const firstChild = missionSection.firstElementChild;
    
    // Check if the first child of the mission section contains the image
    expect(firstChild?.querySelector("img")).toBeInTheDocument();
  });
});