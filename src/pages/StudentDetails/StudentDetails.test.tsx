import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthContext } from '../../context/AuthContext';
import { MockedProvider } from '@apollo/client/testing';
import StudentDetails from './StudentDetails';


vi.mock('lucide-react', () => ({
  User: () => <div data-testid="icon-user" />,
  Mail: () => <div data-testid="icon-mail" />,
  Phone: () => <div data-testid="icon-phone" />,
  MapPin: () => <div data-testid="icon-map" />,
}));

describe('StudentDetails (Parent View)', () => {
  it('renders error state when user is not logged in', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthContext.Provider 
          value={{ 
            user: null, 
            loading: false, 
            login: vi.fn(), 
            logout: vi.fn(), 
            isAuthenticated: false 
          }}
        >
          <StudentDetails />
        </AuthContext.Provider>
      </MockedProvider>
    );

    
   
  });
});