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




});