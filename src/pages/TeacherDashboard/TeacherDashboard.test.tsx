import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import TeacherDashboard from './TeacherDashboard';

describe('TeacherDashboard', () => {
  it('renders teacher-specific features', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Prof. Snape' } } as any}>
        <MemoryRouter>
          <TeacherDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Marks Entry')).toBeDefined();
    expect(screen.getByText(/Prof. Snape/i)).toBeDefined();
  });
});