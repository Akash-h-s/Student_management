// src/graphql/parent.ts
import { gql } from '@apollo/client';

export const GET_STUDENT_DETAILS_BY_PARENT = gql`
  query GetStudentDetailsByParent($parentId: Int!) {
    students(where: { parent_id: { _eq: $parentId }, is_active: { _eq: true } }) {
      id
      name
      admission_no
      marks(order_by: { entered_at: desc }) {
        id
        marks_obtained
        max_marks
        grade
        remarks
        subject {
          id
          name
        }
        exam {
          id
          name
          academic_year
        }
        entered_at
      }
    }
  }
`;