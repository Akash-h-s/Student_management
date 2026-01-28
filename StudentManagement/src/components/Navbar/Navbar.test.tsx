import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import { vi, describe, it, expect } from 'vitest';

// Mock the Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  
  it('1. should show public links when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();

    expect(screen.getByText(/Home/i)).toBeDefined();
    expect(screen.getByText(/Login/i)).toBeDefined();
    expect(screen.getByText(/Signup/i)).toBeDefined();
  });

  it('2. should show Admin specific links when logged in as admin', () => {
    (useAuth as any).mockReturnValue({ 
      user: { name: 'Admin', role: 'admin' }, 
      logout: vi.fn() 
    });
    renderNavbar();

    expect(screen.getByText(/Upload Data/i)).toBeDefined();
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });

  it('3. should show Teacher specific links when logged in as teacher', () => {
    (useAuth as any).mockReturnValue({ 
      user: { name: 'Teacher', role: 'teacher' }, 
      logout: vi.fn() 
    });
    renderNavbar();

    expect(screen.getByText(/Marks Entry/i)).toBeDefined();
    expect(screen.getAllByText(/Messages/i).length).toBeGreaterThan(0);
  });

  it('4. should show profile dropdown content on click', () => {
    (useAuth as any).mockReturnValue({ 
      user: { name: 'John Doe', role: 'student', email: 'john@test.com' }, 
      logout: vi.fn() 
    });
    renderNavbar();

    const profileToggle = screen.getByText('John Doe');
    fireEvent.click(profileToggle);

    // Verify role is displayed (with capitalization logic from component)
    expect(screen.getByText('john@test.com')).toBeDefined();
    expect(screen.getByText('Student')).toBeDefined();
  });

  it('5. should toggle mobile menu on hamburger click', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: vi.fn() });
    renderNavbar();

    // The mobile menu button is usually the only one without text content initially
    const menuBtn = screen.getByRole('button', { name: '' }); 
    fireEvent.click(menuBtn);

    // After clicking, the "Signup" link should appear in the mobile overlay
    const signupLinks = screen.getAllByText(/Signup/i);
    expect(signupLinks.length).toBe(2); // One desktop, one mobile
  });

  it('6. should successfully logout using the dropdown button', () => {
    const logoutMock = vi.fn();
    (useAuth as any).mockReturnValue({ 
      user: { name: 'John Doe', role: 'student' }, 
      logout: logoutMock 
    });
    renderNavbar();

    // Open the dropdown
    fireEvent.click(screen.getByText('John Doe'));
    
    // FIX: Select only the logout button within the dropdown 
    // to avoid the "multiple elements" error
    const logoutBtns = screen.getAllByText(/Logout/i);
    fireEvent.click(logoutBtns[0]); // Desktop logout is the first instance in DOM

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});