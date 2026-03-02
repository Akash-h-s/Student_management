import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import authReducer from '../../store/slices/authSlice';
import MarksReview from './MarksReview';
import { MemoryRouter } from 'react-router-dom';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('MarksReview Component', () => {
  it('renders correctly', () => {
    const store = createMockStore({
      user: { id: 1, name: 'Teacher', role: 'teacher' },
      isAuthenticated: true
    });

    render(
      <MockedProvider mocks={[]}>
        <Provider store={store}>
          <MemoryRouter>
            <MarksReview />
          </MemoryRouter>
        </Provider>
      </MockedProvider>
    );

    expect(screen.getByText(/Class Marks Review/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Class \(e.g., 10\)/i)).toBeDefined();
  });
});
