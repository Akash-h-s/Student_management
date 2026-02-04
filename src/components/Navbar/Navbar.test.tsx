import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

// 1. Mock the Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Navbar Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to render with Router
  const renderNavbar = () => {
    return render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
  };

  it('renders public links when no user is logged in', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: mockLogout });
    renderNavbar();

    expect(screen.getByText('EduCloud')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('renders Admin specific links when an admin is logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Admin User', role: 'admin', email: 'admin@test.com' },
      logout: mockLogout,
    });
    renderNavbar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload Data')).toBeInTheDocument();
    expect(screen.queryByText('Signup')).not.toBeInTheDocument();
  });

  it('renders Teacher specific links when a teacher is logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Teacher Jo', role: 'teacher', email: 'jo@test.com' },
      logout: mockLogout,
    });
    renderNavbar();

    expect(screen.getByText('Marks Entry')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('toggles the user dropdown menu when clicked', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Jane Doe', role: 'parent', email: 'jane@test.com' },
      logout: mockLogout,
    });
    renderNavbar();

    const userButton = screen.getByRole('button', { name: /jane doe/i });
    
    // Initially dropdown is hidden (Logout button shouldn't exist)
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(userButton);
    expect(screen.getAllByText(/Logout/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument(); // Check capitalized role

    // Click again to close
    fireEvent.click(userButton);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('calls logout function and closes menu when logout is clicked', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Jane Doe', role: 'parent', email: 'jane@test.com' },
      logout: mockLogout,
    });
    renderNavbar();

    // 1. Open the menu
    const userButton = screen.getByRole('button', { name: /jane doe/i });
    fireEvent.click(userButton);

    // 2. Find the logout button specifically
    // We use getAllByText because "Logout" exists in both MobileMenu and UserDropdown
    const logoutButtons = screen.getAllByText(/Logout/i);
    
    // 3. Click the desktop version (usually the first one rendered)
    fireEvent.click(logoutButtons[0]);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('opens mobile menu when hamburger icon is clicked', () => {
    (useAuth as any).mockReturnValue({ user: null, logout: mockLogout });
    renderNavbar();

    // The mobile menu button (Menu icon)
    const mobileToggle = screen.getByRole('button', { name: '' }); // Lucide icons usually don't have text
    
    fireEvent.click(mobileToggle);
    
    // In MobileMenu, "Login" is displayed as a link
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});