import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from './Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

global.fetch = vi.fn();

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  it('renders login form with default student role', () => {
    renderLogin();
    
    expect(screen.getByText('EduCloud')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('student');
    expect(screen.getByText(/admission number/i)).toBeInTheDocument();
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    renderLogin();
    const user = userEvent.setup();
    
    const button = screen.getByRole('button', { name: /verify & enter/i });
    await user.click(button);
    
    expect(screen.getByText(/please enter your admission number/i)).toBeInTheDocument();
  });

  it('switches roles and shows appropriate fields', async () => {
    renderLogin();
    const user = userEvent.setup();
    
    const roleSelect = screen.getByRole('combobox');
    await user.selectOptions(roleSelect, 'teacher');
    
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/teacher password/i)).toBeInTheDocument();
    expect(screen.queryByText(/admission number/i)).not.toBeInTheDocument();
  });

  it('successfully logs in student and navigates to dashboard', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        user: { id: '1', role: 'student' },
        token: 'token',
      }),
    });
    
    renderLogin();
    
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'STU001');
    await user.type(inputs[1], 'John Doe');
    await user.click(screen.getByRole('button', { name: /verify & enter/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/student/dashboard');
    });
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        message: 'Invalid credentials',
      }),
    });
    
    renderLogin();
    
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'STU001');
    await user.type(inputs[1], 'John Doe');
    await user.click(screen.getByRole('button', { name: /verify & enter/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        json: async () => ({ success: true, user: { role: 'student' }, token: '' }),
      }), 100))
    );
    
    renderLogin();
    
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'STU001');
    await user.type(inputs[1], 'John Doe');
    await user.click(screen.getByRole('button', { name: /verify & enter/i }));
    
    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});