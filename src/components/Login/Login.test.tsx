import { vi} from 'vitest'; // Ensure all are imported
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

// Create a mock function for fetch
const mockFetch = vi.fn();
// Use stubGlobal to replace the global fetch properly
vi.stubGlobal('fetch', mockFetch);

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
    mockFetch.mockClear();
  });

  it('successfully logs in student and navigates to dashboard', async () => {
    const user = userEvent.setup();
    
    // Type-safe mocking without 'any'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', role: 'student', name: 'John Doe' },
        token: 'fake-jwt-token',
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
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
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
  });
});