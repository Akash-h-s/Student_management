import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MarksEntrySystem from '../MarksEntry/MarksEntry';
import { AuthContext } from '../../context/AuthContext';

// Mock global fetch
global.fetch = vi.fn();

const mockUser = { id: 101, name: 'John Teacher', role: 'teacher' };

describe('MarksEntrySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates the correct grade automatically when marks are entered', async () => {
    // Mock successful student fetch response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        students: [{ id: 1, admission_no: 'S001', name: 'Alice Smith' }]
      }),
    });

    render(
      <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
        <MarksEntrySystem />
      </AuthContext.Provider>
    );

    // Fill out required class and section fields
    fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });

    // FIXED: Use getByRole to avoid ambiguity with multiple text matches
    fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));

    const marksInput = await screen.findByPlaceholderText('0');
    fireEvent.change(marksInput, { target: { value: '95' } });

    // Verify the grade calculation logic (95 = A+)
    expect(screen.getByText('A+')).toBeDefined();
  });
});