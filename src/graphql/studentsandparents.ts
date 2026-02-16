// src/graphql/parent.ts
import { gql } from '@apollo/client';

export const GET_STUDENT_DETAILS_BY_PARENT = gql`
  query GetStudentDetailsByParent($parentId: Int!) {
    students(where: { parent_id: { _eq: $parentId }, is_active: { _eq: true } }) {
      id
      name
      admission_no
      created_by_admin_id
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

export const GET_ADMIN_SCHOOL_DETAILS = gql`
  query GetAdminSchoolDetails($adminId: Int!) {
    admins_by_pk(id: $adminId) {
      id
      school_name
      school_address
      school_phone
      school_logo_url
    }
  }
`;