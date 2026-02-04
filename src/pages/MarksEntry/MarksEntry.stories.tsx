// src/pages/MarksEntry/MarksEntrySystem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import MarksEntrySystem from './MarksEntry';
import { AuthProvider } from '../../context/AuthContext';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  INSERT_MARKS,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
} from '../../graphql/marks';

// ==================== MOCK DATA ====================
const mockStudents = [
  { id: 1, admission_no: 'STU001', name: 'Alice Johnson' },
  { id: 2, admission_no: 'STU002', name: 'Bob Smith' },
  { id: 3, admission_no: 'STU003', name: 'Charlie Brown' },
  { id: 4, admission_no: 'STU004', name: 'Diana Prince' },
  { id: 5, admission_no: 'STU005', name: 'Ethan Hunt' },
];

const mockTeacher = {
  id: '101',
  name: 'Ms. Sarah Thompson',
  email: 'sarah.thompson@school.com',
  role: 'teacher',
};

// ==================== MOCK APOLLO RESPONSES ====================
const successfulStudentFetchMock = {
  request: {
    query: GET_STUDENTS_BY_CLASS_SECTION,
    variables: { className: '10', sectionName: 'A' },
  },
  result: {
    data: {
      class_sections: [
        {
          students: mockStudents,
        },
      ],
    },
  },
};

const successfulSubjectCreationMock = {
  request: {
    query: GET_OR_CREATE_SUBJECT,
  },
  result: {
    data: {
      insert_subjects_one: { id: 1 },
    },
  },
};

const successfulExamCreationMock = {
  request: {
    query: GET_OR_CREATE_EXAM,
  },
  result: {
    data: {
      insert_exams_one: { id: 1 },
    },
  },
};

const successfulMarksInsertionMock = {
  request: {
    query: INSERT_MARKS,
  },
  result: {
    data: {
      insert_marks: {
        affected_rows: 5,
      },
    },
  },
};

// ==================== DECORATOR ====================
const withAuthProvider = (Story: any, context: any) => {
  const { user } = context.parameters;
  
  return (
    <AuthProvider value={{ user: user || mockTeacher, login: () => {}, logout: () => {} }}>
      <Story />
    </AuthProvider>
  );
};

// ==================== META ====================
const meta: Meta<typeof MarksEntrySystem> = {
  title: 'Pages/MarksEntrySystem',
  component: MarksEntrySystem,
  decorators: [withAuthProvider],
  parameters: {
    layout: 'fullscreen',
    user: mockTeacher,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarksEntrySystem>;

// ==================== STORIES ====================

/**
 * Default state - Empty form ready for teacher input
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[successfulStudentFetchMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};

/**
 * With students loaded - Ready for marks entry
 * Shows the table with student list after fetching
 */
export const WithStudentsLoaded: Story = {
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          successfulStudentFetchMock,
          successfulSubjectCreationMock,
          successfulExamCreationMock,
          successfulMarksInsertionMock,
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
};

/**
 * Not authenticated - Shows error when teacher is not logged in
 */
export const NotAuthenticated: Story = {
  parameters: {
    user: null,
  },
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};