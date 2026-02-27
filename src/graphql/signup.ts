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
