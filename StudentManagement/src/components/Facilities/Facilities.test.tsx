import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Facilities from "./Facilities";
import "@testing-library/jest-dom";

describe("Facilities Component", () => {
  it("renders the main heading and list of facilities", () => {
    render(<Facilities />);
    
    // Check main title
    expect(screen.getByText(/Facilities for Students/i)).toBeInTheDocument();
    
    // Check if specific items from your array appear
    expect(screen.getByText("Smart Classrooms")).toBeInTheDocument();
    expect(screen.getByText("Robotics & STEM Programs")).toBeInTheDocument();
  });

  it("renders the correct number of facility cards", () => {
    render(<Facilities />);
    // Since each facility has a title in an h3
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(10);
  });

  it("does not show the popup on initial load", () => {
    render(<Facilities />);
    const closeButton = screen.queryByRole("button", { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });
});