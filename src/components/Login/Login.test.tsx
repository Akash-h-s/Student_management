import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';
import { GET_STUDENT_BY_ADMISSION_NUMBER, GET_ADMIN_BY_EMAIL } from '../../graphql/login';

// Mocks
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn().mockResolvedValue(true) },
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful student login and navigation', async () => {
    const studentMock = {
      request: {
        query: GET_STUDENT_BY_ADMISSION_NUMBER,
        variables: { admissionNumber: 'STU123', name: 'John Doe' },
      },
      result: {
        data: { students: [{ id: 101, name: 'John Doe', email: 'john@school.com' }] }
      },
    };

    const { container } = render(
      <MockedProvider mocks={[studentMock]} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    // 1. Find text inputs by their order in the DOM (Identifier, then Name)
    const textInputs = container.querySelectorAll('input[type="text"]');
    fireEvent.change(textInputs[0], { target: { value: 'STU123' } });
    fireEvent.change(textInputs[1], { target: { value: 'John Doe' } });

    // 2. Click submit
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ id: 101, role: 'student' }),
        expect.any(String)
      );
    });
  });

  it('shows error if admin is not found', async () => {
    const adminMock = {
      request: {
        query: GET_ADMIN_BY_EMAIL,
        variables: { email: 'admin@school.com' },
      },
      result: { data: { admins: [] } },
    };

    const { container } = render(
      <MockedProvider mocks={[adminMock]} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    // 1. Switch Role to Admin
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } });

    // 2. Find Email input (type="email") and Password input (type="password")
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    if (emailInput) fireEvent.change(emailInput, { target: { value: 'admin@school.com' } });
    if (passwordInput) fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 3. Submit
    fireEvent.click(screen.getByRole('button'));

    // 4. Check for error message text
    expect(await screen.findByText(/admin not found/i)).toBeInTheDocument();
  });
});