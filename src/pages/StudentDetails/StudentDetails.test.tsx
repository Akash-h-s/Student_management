import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import StudentDetails from './StudentDetails';

describe('StudentDetails (Parent View)', () => {
  it('renders error state when user is not logged in', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: false } as any}>
        <StudentDetails />
      </AuthContext.Provider>
    );
    expect(screen.getByText('User not logged in')).toBeDefined();
  });
});