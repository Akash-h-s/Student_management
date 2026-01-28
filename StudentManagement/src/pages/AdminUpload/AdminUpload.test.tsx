import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../AdminDashboard/AdminDashboard';

// Mock the Auth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AdminDashboard Component', () => {
  it('1. should display personalized welcome message with user name', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Principal Smith', role: 'admin' },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, Principal Smith!/i)).toBeDefined();
  });

  it('2. should render all administrative feature cards', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Admin', role: 'admin' },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Upload Student Data')).toBeDefined();
    expect(screen.getByText('Upload Teacher Data')).toBeDefined();
  });

  it('3. should have correct navigation links on feature cards', () => {
    (useAuth as any).mockReturnValue({
      user: { name: 'Admin', role: 'admin' },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const studentCard = screen.getByRole('link', { name: /Upload Student Data/i });
    expect(studentCard.getAttribute('href')).toBe('/admin/upload');
  });

  it('4. should handle cases where user name might be missing gracefully', () => {
    (useAuth as any).mockReturnValue({
      user: null,
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Should render "Welcome back, !" or similar without crashing
    expect(screen.getByText(/Welcome back,/i)).toBeDefined();
  });
});