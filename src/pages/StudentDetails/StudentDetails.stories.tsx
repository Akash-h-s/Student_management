// src/pages/StudentDetails/StudentDetails.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import StudentDetails from './StudentDetails';
import { GET_STUDENT_DETAILS_BY_PARENT } from '../../graphql/studentsandparents';

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
  render: () => (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={{
        user: { id: 1, name: 'Parent User', role: 'parent', email: 'parent@test.com' },
        login: () => { },
        logout: () => { },
        loading: false,
        isAuthenticated: true
      }}>
        <StudentDetails />
      </AuthContext.Provider>
    </MockedProvider>
  )
};