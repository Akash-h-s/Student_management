import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    students_aggregate {
      aggregate {
        count
      }
    }
    teachers_aggregate {
      aggregate {
        count
      }
    }
    class_sections_aggregate {
      aggregate {
        count
      }
    }
    parents_aggregate {
      aggregate {
        count
      }
    }
    admins_aggregate {
      aggregate {
        count
      }
    }
  }
`;
