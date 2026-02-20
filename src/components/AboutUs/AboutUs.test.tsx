/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import AboutUs from "./AboutUs";

describe("AboutUs Component", () => {
  it("renders the main heading and intro paragraphs", () => {
    render(<AboutUs />);

    expect(screen.getByText("About Us"));
    expect(
      screen.getByText(/Student Management System is designed to simplify/i)
    );
  });

  it("renders all four feature cards", () => {
    render(<AboutUs />);

    expect(screen.getByText("Student Support"));
    expect(screen.getByText("Teacher Management"));
    expect(screen.getByText("Parent Access"));
    expect(screen.getByText("Smart Analytics"));
  });




});