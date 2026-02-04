import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminUpload from './AdminUpload';

// Correct way to mock global fetch in Vitest
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('AdminUpload Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders correctly and shows student fields only when selected', async () => {
    render(<AdminUpload />);
    
    expect(screen.queryByPlaceholderText(/Enter Class/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'student' } });
    
    expect(screen.getByPlaceholderText(/Enter Class/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Section/i)).toBeInTheDocument();
  });

  it('successfully starts a workflow and shows progress', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflowId: 'wf-123' }),
    });

    render(<AdminUpload />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'teacher' } });
    
    const file = new File(['hello'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByLabelText(/Choose File/i);
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Start Upload'));

    await waitFor(() => {
      expect(screen.getByText(/Processing Workflow/i)).toBeInTheDocument();
      expect(screen.getByText(/wf-123/i)).toBeInTheDocument();
    });
  });

  it('stops polling and shows success message on completion', async () => {
    mockFetch
      .mockResolvedValueOnce({ // Initial upload
        ok: true,
        json: async () => ({ workflowId: 'wf-456' }),
      })
      .mockResolvedValueOnce({ // Status check
        ok: true,
        json: async () => ({ 
          status: 'completed', 
          recordsProcessed: 50, 
          currentStep: 'Finalizing' 
        }),
      });

    render(<AdminUpload />);
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'teacher' } });
    const file = new File(['data'], 'teachers.xlsx', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText(/Choose File/i), { target: { files: [file] } });
    fireEvent.click(screen.getByText('Start Upload'));

    await waitFor(() => {
      expect(screen.getByText(/Successfully processed 50 records/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});