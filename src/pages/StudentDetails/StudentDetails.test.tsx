import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import authReducer from '../../store/slices/authSlice';
import StudentDetails from './StudentDetails';
import { MESSAGES } from './constants';

vi.mock('lucide-react', () => ({
  User: () => <div data-testid="icon-user" />,
  Mail: () => <div data-testid="icon-mail" />,
  Phone: () => <div data-testid="icon-phone" />,
  MapPin: () => <div data-testid="icon-map" />,
}));

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('StudentDetails (Parent View)', () => {
  it('renders error state when user is not logged in', () => {
    const store = createMockStore({
      user: null,
      isAuthenticated: false
    });

    render(
      <MockedProvider mocks={[]}>
        <Provider store={store}>
          <StudentDetails />
        </Provider>
      </MockedProvider>
    );

    expect(screen.getByText(MESSAGES.NOT_LOGGED_IN)).toBeDefined();
    expect(screen.getByText(MESSAGES.LOGIN_REQUIRED)).toBeDefined();
  });
});