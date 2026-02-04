import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';

const mocks = [/* Define Apollo GraphQL Mocks here matching GET_STUDENT_DETAILS */];

describe('StudentDashboard', () => {
  it('shows loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthContext.Provider value={{ user: { id: 1 } } as any}>
          <StudentDashboard />
        </AuthContext.Provider>
      </MockedProvider>
    );
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});