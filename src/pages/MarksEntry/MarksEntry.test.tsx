import { render, screen, fireEvent} from '@testing-library/react';
import { vi} from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import MarksEntrySystem from './MarksEntry';
import { 
  GET_STUDENTS_BY_CLASS_SECTION, 
  GET_OR_CREATE_SUBJECT, 
  GET_OR_CREATE_EXAM, 
  INSERT_MARKS 
} from '../../graphql/marks';

const mockUser = { id: '101', name: 'John Teacher', role: 'teacher' };

// 1. Mock for Fetching Students
const studentsMock = {
  request: {
    query: GET_STUDENTS_BY_CLASS_SECTION,
    variables: { className: '10', sectionName: 'A' },
  },
  result: {
    data: {
      class_sections: [
        {
          students: [{ id: 1, admission_no: 'S001', name: 'Alice Smith' }]
        }
      ]
    },
  },
};

// 2. Mock for Saving Marks (Subject, Exam, and Insert)
const saveMocks = [
  {
    request: {
      query: GET_OR_CREATE_SUBJECT,
      variables: { name: 'Math', className: '10', teacherId: 101 },
    },
    result: { data: { insert_subjects_one: { id: 50 } } },
  },
  {
    request: {
      query: GET_OR_CREATE_EXAM,
      variables: { name: 'Final', academicYear: '2024-25' },
    },
    result: { data: { insert_exams_one: { id: 200 } } },
  },
  {
    request: {
      query: INSERT_MARKS,
      variables: { marks: [expect.anything()] },
    },
    result: { data: { insert_marks: { affected_rows: 1 } } },
  },
];

describe('MarksEntrySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student list and calculates grade when marks are entered', async () => {
    render(
      <MockedProvider mocks={[studentsMock]} addTypename={false}>
        <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
          <MarksEntrySystem />
        </AuthContext.Provider>
      </MockedProvider>
    );

    // Fill form and fetch
    fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));

    // Wait for student Alice Smith to appear
    const studentName = await screen.findByText('Alice Smith');
    expect(studentName).toBeInTheDocument();

    // Enter marks
    const marksInput = screen.getByRole('spinbutton');
    fireEvent.change(marksInput, { target: { value: '95' } });

    // Verify automatic grade calculation
    expect(screen.getByText('A+')).toBeInTheDocument();
  });

  it('validates required fields before allowing save', async () => {
  render(
    <MockedProvider mocks={[studentsMock]} addTypename={false}>
      <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
        <MarksEntrySystem />
      </AuthContext.Provider>
    </MockedProvider>
  );

  // 1. Fetch Students (Satisfies students.length > 0)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
  fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));
  
  // Wait for the table to render Alice
  await screen.findByText('Alice Smith');

  // 2. Enter Marks (Satisfies marksData.some check in canSave)
  // Note: type="number" inputs are best targeted by role 'spinbutton'
  const marksInput = screen.getByRole('spinbutton');
  fireEvent.change(marksInput, { target: { value: '85' } });

  // 3. Click Save
  // At this point, canSave is true (students exist + teacher exists + marks entered)
  // But handleSaveMarks will fail the check: if (!subjectName || !examName)
  const saveBtn = screen.getByRole('button', { name: /Save Marks/i });
  
  // Sanity check: ensure button is enabled
  expect(saveBtn).not.toBeDisabled();
  
  fireEvent.click(saveBtn);

  // 4. Verify error message appears
  // Use findByText for elements that appear after a state update
  expect(await screen.findByText(/Please fill all required fields/i)).toBeInTheDocument();
});
  it('validates required fields before allowing save', async () => {
  render(
    <MockedProvider mocks={[studentsMock]} addTypename={false}>
      <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
        <MarksEntrySystem />
      </AuthContext.Provider>
    </MockedProvider>
  );

  // 1. Fetch Students (Satisfies students.length > 0)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
  fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });
  fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));
  await screen.findByText('Alice Smith');

  // 2. Enter some marks (Satisfies the marksData check in canSave)
  const marksInput = screen.getByRole('spinbutton');
  fireEvent.change(marksInput, { target: { value: '85' } });

  // 3. Click Save (Leaving Subject/Exam empty to trigger the error message)
  const saveBtn = screen.getByRole('button', { name: /Save Marks/i });
  
  // Verify button is NOT disabled before clicking
  expect(saveBtn).not.toBeDisabled();
  
  fireEvent.click(saveBtn);

  // 4. Check for error message
  expect(await screen.findByText(/Please fill all required fields/i)).toBeInTheDocument();
});
});