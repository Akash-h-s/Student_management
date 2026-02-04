
import { gql } from '@apollo/client';

// ==================== LOGIN QUERIES ====================

export const GET_ADMIN_BY_EMAIL = gql`
  query GetAdminByEmail($email: String!) {
    admins(where: { email: { _eq: $email } }) {
      id
      school_name
      email
      password_hash
      phone
      created_at
    }
  }
`;

export const GET_TEACHER_BY_EMAIL = gql`
  query GetTeacherByEmail($email: String!) {
    teachers(where: { email: { _eq: $email } }) {
      id
      name
      email
      password_hash
      phone
      qualification
      is_active
      created_at
    }
  }
`;

export const GET_PARENT_BY_EMAIL = gql`
  query GetParentByEmail($email: String!) {
    parents(where: { email: { _eq: $email } }) {
      id
      name
      email
      password_hash
      phone
      address
      created_at
    }
  }
`;

export const GET_STUDENT_BY_ADMISSION_NUMBER = gql`
  query GetStudentByAdmissionNumber($admissionNumber: String!, $name: String!) {
    students(
      where: { 
        admission_no: { _eq: $admissionNumber }
        name: { _eq: $name }
      }
    ) {
      id
      admission_no
      name
      dob
      gender
      is_active
      class_section_id
      class_section {
        id
        class_name
        section_name
        display_name
      }
      parent_id
      parent {
        id
        name
        email
        phone
      }
      created_at
    }
  }
`;