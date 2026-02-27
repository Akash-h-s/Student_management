import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import MarksEntrySystem from './MarksEntry';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  INSERT_MARKS,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
} from '../../graphql/marks';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const mockStudents = [
  { id: 1, admission_no: 'STU001', name: 'Alice Johnson' },
  { id: 2, admission_no: 'STU002', name: 'Bob Smith' },
];

const mockTeacher = {
  id: 101,
  name: 'Ms. Sarah Thompson',
  email: 'sarah.thompson@school.com',
  role: 'teacher',
};

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

const meta: Meta<typeof MarksEntrySystem> = {
  title: 'Pages/MarksEntrySystem',
  component: MarksEntrySystem,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MarksEntrySystem>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[successfulStudentFetchMock]} addTypename={false}>
        <Provider store={createMockStore({
          user: mockTeacher,
          isAuthenticated: true,
          loading: false
        })}>
          <Story />
        </Provider>
      </MockedProvider>
    ),
  ],
};