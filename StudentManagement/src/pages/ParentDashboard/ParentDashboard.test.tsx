import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import ParentDashboard from './ParentDashboard';

describe('ParentDashboard', () => {
  it('renders welcome message with parent name', () => {
    const mockUser = { name: 'John Doe', role: 'parent' };
    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
        <MemoryRouter>
          <ParentDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Welcome back, John Doe!/i)).toBeDefined();
    expect(screen.getByText('Student Details')).toBeDefined();
    expect(screen.getByText('Messages')).toBeDefined();
  });
});