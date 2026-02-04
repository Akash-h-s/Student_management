import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HelpUs from "./HelpUs";

describe("HelpUs Component", () => {
  it("renders all default guides", () => {
    render(<HelpUs />);
    expect(screen.getByText(/Admin Guide Made Simple/i)).toBeInTheDocument();
    expect(screen.getByText(/Teacher Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Parent Guide/i)).toBeInTheDocument();
  });

  it("alternates image position correctly", () => {
    const { container } = render(<HelpUs />);
    // Select all GuideCard containers
    const guideCards = container.querySelectorAll(".flex-col.md\\:flex-row");
    
    // index 0: isImageLeft = false (Image should be second/right)
    // index 1: isImageLeft = true (Image should be first/left)
    
    const secondCard = guideCards[1];
    const firstChildOfSecondCard = secondCard.firstElementChild;
    
    // The first child of the second card should be the Image container
    expect(firstChildOfSecondCard?.querySelector("img")).toBeInTheDocument();
  });

  it("renders the correct number of steps for each guide", () => {
    render(<HelpUs />);
    // The Admin guide has 4 steps
    const adminGuideSteps = screen.getAllByText(/Register your admin account|Set up school details/i);
    expect(adminGuideSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("applies the correct background color classes", () => {
    render(<HelpUs />);
    const adminSection = screen.getByText(/Admin Guide Made Simple/i).closest('div');
    expect(adminSection).toHaveClass("bg-emerald-300");
  });
});