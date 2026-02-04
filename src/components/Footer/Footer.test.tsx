import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "./Footer";

describe("Footer Component", () => {
  it("renders the brand name and about text correctly", () => {
    render(<Footer />);
    expect(screen.getByText(/About Us/i)).toBeInTheDocument();
    expect(screen.getByText(/EduCloud Smart Management System/i)).toBeInTheDocument();
  });

  it("renders the full list of services", () => {
    render(<Footer />);
    const services = [
      "Student Management",
      "Teacher & Staff Management",
      "Attendance Tracking",
    ];
    
    services.forEach(service => {
      expect(screen.getByText(service)).toBeInTheDocument();
    });
  });

  it("displays the correct current year in copyright", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("updates contact info when props are provided", () => {
    const customContact = {
      email: "hello@test.com",
      phone: "123-456",
      address: "Test Lane"
    };
    render(<Footer contactInfo={customContact} />);
    expect(screen.getByText(/Email: hello@test.com/i)).toBeInTheDocument();
  });
});