import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import MarksEntrySystem from './MarksEntry';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
  INSERT_MARKS,
  GET_ALL_SUBJECTS,
  CHECK_EXAM_EXISTS,
  CHECK_EXISTING_MARKS
} from '../../graphql/marks';

const mockUser = { id: '101', name: 'John Teacher', role: 'teacher' };

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

const saveMocks = [
  {
    request: {
      query: GET_OR_CREATE_SUBJECT,
      variables: { name: 'math', className: '10', teacherId: 101 },
    },
    result: { data: { insert_subjects_one: { id: 50 } } },
  },
  {
    request: {
      query: GET_OR_CREATE_EXAM,
      variables: { name: 'FA1', academicYear: '2024-25' },
    },
    result: { data: { insert_exams_one: { id: 200 } } },
  },
  {
    request: {
      query: INSERT_MARKS,
      variables: { marks: expect.anything() },
    },
    result: { data: { insert_marks: { affected_rows: 1 } } },
  },
  {
    request: {
      query: GET_ALL_SUBJECTS,
      variables: { className: '10' },
    },
    result: { data: { subjects: [] } },
  },
  {
    request: {
      query: GET_ALL_SUBJECTS,
      variables: { className: '10' },
    },
    result: { data: { subjects: [{ id: 50, name: 'Math' }] } },
  },
  {
    request: {
      query: CHECK_EXAM_EXISTS,
      variables: { name: 'FA1', academicYear: '2024-25' },
    },
    result: { data: { exams: [] } },
  },
  {
    request: {
      query: CHECK_EXISTING_MARKS,
      variables: { subjectId: 50, examId: 200, studentIds: [1] },
    },
    result: { data: { marks: [] } },
  },
  {
    request: {
      query: GET_OR_CREATE_SUBJECT,
      variables: { name: 'math', className: '10', teacherId: 101 },
    },
    result: { data: { insert_subjects_one: { id: 50 } } },
  },
  {
    request: {
      query: GET_OR_CREATE_EXAM,
      variables: { name: 'FA1', academicYear: '2024-25' },
    },
    result: { data: { insert_exams_one: { id: 200 } } },
  }
];

describe('MarksEntrySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });





  it('shows error if fetch clicked without subject/exam', async () => {
    render(
      <MockedProvider mocks={[studentsMock]} addTypename={false}>
        <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
          <MarksEntrySystem />
        </AuthContext.Provider>
      </MockedProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });

    fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));

    expect(await screen.findByText(/Please fill all required fields/i)).toBeInTheDocument();
  });
});