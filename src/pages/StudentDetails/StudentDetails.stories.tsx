import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import StudentDetails from './StudentDetails';
import { GET_STUDENT_DETAILS_BY_PARENT } from '../../graphql/studentsandparents';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const meta: Meta<typeof StudentDetails> = {
  title: 'Pages/Parent/StudentDetails',
  component: StudentDetails,
};

export default meta;

type Story = StoryObj<typeof StudentDetails>;

const mocks = [
  {
    request: {
      query: GET_STUDENT_DETAILS_BY_PARENT,
      variables: { parentId: 1 },
    },
    result: {
      data: {
        students: [
          {
            id: 1,
            name: "Rahul Sharma",
            admission_no: "ADM2023001",
            marks: [
              {
                id: 1,
                marks_obtained: 85,
                max_marks: 100,
                grade: "A",
                remarks: "Excellent",
                subject: {
                  id: 1,
                  name: "Mathematics"
                },
                exam: {
                  id: 1,
                  name: "Mid Term",
                  academic_year: "2023-2024"
                },
                entered_at: "2023-10-15T10:00:00"
              },
              {
                id: 2,
                marks_obtained: 78,
                max_marks: 100,
                grade: "B+",
                remarks: "Good",
                subject: {
                  id: 2,
                  name: "Science"
                },
                exam: {
                  id: 1,
                  name: "Mid Term",
                  academic_year: "2023-2024"
                },
                entered_at: "2023-10-15T10:00:00"
              }
            ]
          }
        ]
      }
    }
  }
];

export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <Provider store={createMockStore({
          user: { id: 1, name: 'Parent User', role: 'parent', email: 'parent@test.com' },
          isAuthenticated: true,
          loading: false
        })}>
          <Story />
        </Provider>
      </MockedProvider>
    )
  ]
};