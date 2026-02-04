import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Facilities from "./Facilities";

describe("Facilities Component", () => {
  it("renders the section header with correct title and subtitle", () => {
    render(<Facilities />);

    expect(screen.getByText("Facilities for Students")).toBeInTheDocument();

   
    expect(screen.getByText(/Supporting education through/i)).toBeInTheDocument();
    expect(screen.getByText("benefits")).toHaveClass("text-orange-500");
    expect(screen.getByText(/and resources/i)).toBeInTheDocument();
  });

  it("renders all default facility cards", () => {
    render(<Facilities />);

    const facilityTitles = [
      "Smart Classrooms",
      "Advanced Computer Labs",
      "Robotics & STEM Programs",
      "Spoken English & Personality Development",
      "Professional Sports Coaching",
      "Air-Conditioned Classrooms",
      "Digital Attendance & Parent App",
      "CCTV Security",
      "School Transport with GPS",
      "Library & Reading Programs",
    ];

    facilityTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders correct descriptions for facility cards", () => {
    render(<Facilities />);

   
    expect(
      screen.getByText(/Digital classrooms with projectors and interactive boards/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Safe school buses with live GPS tracking/i)
    ).toBeInTheDocument();
  });

  it("applies correct styling classes to icons containers", () => {
    const { container } = render(<Facilities />);

    
    const firstIconContainer = container.querySelector(".bg-blue-100");
    expect(firstIconContainer).toBeInTheDocument();
    expect(firstIconContainer).toHaveClass("w-16", "h-16", "rounded-xl");
  });

 

  it("does not render the popup by default", () => {
    render(<Facilities />);
    
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });
});