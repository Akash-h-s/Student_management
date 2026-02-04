// src/pages/AdminUpload/AdminUpload.test.tsx
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminUpload from './AdminUpload';


global.fetch = vi.fn();


class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;
  
  readAsDataURL() {
    // Simulate async file reading immediately
    setTimeout(() => {
      this.result = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,dGVzdA==';
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

// Helper function to upload file
const uploadFile = (input: HTMLInputElement, file: File) => {
  // Create a new FileList-like object
  const fileList = {
    0: file,
    length: 1,
    item: (index: number) => (index === 0 ? file : null),
    [Symbol.iterator]: function* () {
      yield file;
    }
  };
  
  // Set the files property
  Object.defineProperty(input, 'files', {
    value: fileList,
    writable: false,
    configurable: true
  });
  
  // Trigger change event
  fireEvent.change(input);
};

describe('AdminUpload Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should render the component', () => {
    render(<AdminUpload />);
    expect(screen.getByText('Admin Upload Portal')).toBeInTheDocument();
  });

  it('should display upload type selection', () => {
    render(<AdminUpload />);
    expect(screen.getByText('Select Upload Category')).toBeInTheDocument();
  });

  it('should show student fields when student type is selected', () => {
    render(<AdminUpload />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'student' } });

    expect(screen.getByPlaceholderText('Enter Class (e.g. 10)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Section (e.g. A)')).toBeInTheDocument();
  });

  it('should enable upload button when file and type are selected', () => {
    render(<AdminUpload />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'teacher' } });

    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    uploadFile(fileInput, file);

    const uploadButton = screen.getByText('Start Upload');
    expect(uploadButton).not.toBeDisabled();
  });

  it('should show file name after selection', () => {
    render(<AdminUpload />);
    
    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    uploadFile(fileInput, file);

    expect(screen.getByText('test.xlsx')).toBeInTheDocument();
  });

  it('should show progress when upload starts', async () => {
    // Mock the upload API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflowId: 'test-workflow-123' })
    });

    // Mock subsequent workflow status calls to immediately return completed
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        workflowId: 'test-workflow-123',
        status: 'completed',
        currentStep: 'Upload completed successfully!',
        progress: 100,
        recordsProcessed: 10,
        emailsSent: 10
      })
    });

    render(<AdminUpload />);
    
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'teacher' } });
    });

    const file = new File(['test'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      uploadFile(fileInput, file);
    });

    const uploadButton = screen.getByText('Start Upload');
    
    await act(async () => {
      fireEvent.click(uploadButton);
    });

    // Wait for processing state - it should appear briefly
    await waitFor(() => {
      expect(screen.getByText(/Processing Workflow|Upload Successful/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});