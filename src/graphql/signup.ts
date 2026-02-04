// src/graphql/signup.ts
import { gql } from '@apollo/client';

// Check if admin email already exists
export const CHECK_ADMIN_EMAIL = gql`
  query CheckAdminEmail($email: String!) {
    admins(where: { email: { _eq: $email } }) {
      id
      email
    }
  }
`;

// Insert new admin
export const INSERT_ADMIN = gql`
  mutation InsertAdmin(
    $school_name: String!
    $email: String!
    $password_hash: String!
    $phone: String!
  ) {
    insert_admins_one(
      object: {
        school_name: $school_name
        email: $email
        password_hash: $password_hash
        phone: $phone
      }
    ) {
      id
      school_name
      email
      phone
      created_at
    }
  }
`;