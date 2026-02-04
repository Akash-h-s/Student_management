import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Footer from './Footer';

describe('Footer Component', () => {
  test('renders all major sections and handles duplicate brand names', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /contact info/i })).toBeInTheDocument();

   
    expect(screen.getByText(/EduCloud Smart Management System is designed to simplify/i)).toBeInTheDocument();
    const copyrightSection = screen.getByText(/All rights reserved/i);
    expect(copyrightSection).toBeInTheDocument();
    expect(copyrightSection).toHaveTextContent(/EduCloud Smart Management System/i);
  });
  test('renders custom company name and contact info when props are provided', () => {
    const customName = "Innovate School";
    const customContact = {
      email: "hello@innovate.edu",
      phone: "999-000-1111",
      address: "123 Tech Park, Silicon Valley"
    };

    render(
      <Footer 
        companyName={customName} 
        contactInfo={customContact} 
      />
    );

    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} ${customName}`, 'i'))).toBeInTheDocument();
    
   
    expect(screen.getByText(/hello@innovate.edu/i)).toBeInTheDocument();
    expect(screen.getByText(/999-000-1111/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Tech Park/i)).toBeInTheDocument();
  });

  test('should have correct semantic structure and dynamic current year', () => {
    render(<Footer />);
   
    const footerTag = screen.getByRole('contentinfo');
    expect(footerTag).toBeInTheDocument();
    expect(footerTag).toHaveClass('bg-slate-800');
    const currentYear = new Date().getFullYear().toString();
    const copyrightText = screen.getByText(new RegExp(currentYear));
    expect(copyrightText).toBeInTheDocument();
  });
});