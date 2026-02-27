import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HelpUs from "./HelpUs";

describe("HelpUs Component", () => {
  it("renders all default guides", () => {
    render(<HelpUs />);
    expect(screen.getByText(/Admin: Institutional Control/i)).toBeInTheDocument();
    expect(screen.getByText(/Must & Should: Data Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/Teacher: Academic Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Student & Parent: Progress Tracking/i)).toBeInTheDocument();
  });

  it("alternates image position correctly", () => {
    const { container } = render(<HelpUs />);
    // Select all flex-row containers (GuideCards)
    const guideCards = container.querySelectorAll(".flex-col.md\\:flex-row");

    // index 0: isImageLeft = false (DEFAULT_GUIDES[0] image is at bottom/right)
    // index 1: isImageLeft = true (DEFAULT_GUIDES[1] image is at top/left)

    const secondCard = guideCards[1];
    const firstChildOfSecondCard = secondCard.firstElementChild;

    // The first child of the second card should be the Image container
    expect(firstChildOfSecondCard?.querySelector("img")).toBeInTheDocument();
  });

  it("renders the correct steps for the data rules guide", () => {
    render(<HelpUs />);
    expect(screen.getByText(/MUST: Include full name/i)).toBeInTheDocument();
    expect(screen.getByText(/FORMAT: Your files should be/i)).toBeInTheDocument();
  });

  it("applies the correct background color classes", () => {
    render(<HelpUs />);
    const dataRulesSection = screen.getByText(/Must & Should: Data Rules/i).closest('div');
    expect(dataRulesSection).toHaveClass("bg-red-500");

    const adminSection = screen.getByText(/Admin: Institutional Control/i).closest('div');
    expect(adminSection).toHaveClass("bg-emerald-300");
  });
});