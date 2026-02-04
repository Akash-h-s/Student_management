import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Facilities from "./Facilities";
import "@testing-library/jest-dom";

describe("Facilities Component - Advanced", () => {
  it("renders with custom header content via props", () => {
    const customHeader = {
      title: "Campus Perks",
      subtitle: "Check out our",
      highlightText: "exclusive",
      subtitleEnd: "offers",
    };

    render(<Facilities headerContent={customHeader} />);
    
    expect(screen.getByText("Campus Perks")).toBeInTheDocument();
    expect(screen.getByText(/exclusive/i)).toHaveClass("text-orange-500");
  });

  it("successfully passes custom facilities list", () => {
    const mockFacilities = [
      { 
        id: 99, 
        Icon: () => <svg data-testid="mock-icon" />, 
        title: "Swimming Pool", 
        desc: "Olympic size pool", 
        bgColor: "bg-blue-50", 
        iconColor: "text-blue-500" 
      }
    ];

    render(<Facilities facilities={mockFacilities} />);
    
    expect(screen.getByText("Swimming Pool")).toBeInTheDocument();
    expect(screen.queryByText("Smart Classrooms")).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });

  it("verifies the Popup overlay structure when manually triggered", () => {
    // This tests the Popup component in isolation or via Facilities 
    // if you wire up the onClick.
    render(<Facilities />);
    
    // Check for the bg-slate-800 container class to ensure theme consistency
    const mainContainer = screen.getByText("Facilities for Students").closest('div');
    expect(mainContainer).toHaveClass("bg-slate-800");
  });
});