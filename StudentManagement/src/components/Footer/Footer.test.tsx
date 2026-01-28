import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import '@testing-library/jest-dom';

describe('Footer Component', () => {
  it('should render the "About Us" section and system description', () => {
    render(<Footer />);
    
    // Check for the unique heading
    expect(screen.getByRole('heading', { name: /About Us/i })).toBeInTheDocument();
    
    // Finding the description text instead of the system name (to avoid duplicates)
    expect(screen.getByText(/simplify school, student, and teacher management/i)).toBeInTheDocument();
  });

  it('should render all 5 services in the list', () => {
    render(<Footer />);
    const services = [
      "Student Management",
      "Teacher & Staff Management",
      "Attendance Tracking",
      "Exam & Result Management",
      "Parent Notifications",
    ];

    services.forEach((service) => {
      expect(screen.getByText(service)).toBeInTheDocument();
    });
  });

  it('should render contact information correctly', () => {
    render(<Footer />);
    expect(screen.getByText(/support@educloud.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+91 6360434523/i)).toBeInTheDocument();
    expect(screen.getByText(/Bengaluru, India/i)).toBeInTheDocument();
  });

  it('should display the current year and system name in the copyright notice', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    
    // Using a regex to match the text inside the footer copyright area
    const copyrightRegex = new RegExp(`© ${currentYear} EduCloud Smart Management System`, 'i');
    expect(screen.getByText(copyrightRegex)).toBeInTheDocument();
  });

  it('should have the correct background styling class', () => {
    const { container } = render(<Footer />);
    const footerElement = container.querySelector('footer');
    expect(footerElement).toHaveClass('bg-slate-800');
  });
});