import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import StudentDashboard from './StudentDashboard';

// Mock the query if needed, but for now we just want to render without crashing on Redux/Apollo context
const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('StudentDashboard', () => {
  it('renders loading state initially', () => {
    const store = createMockStore({
      user: { id: 1, name: 'Test Student', role: 'student' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MockedProvider mocks={[]} addTypename={false}>
          <StudentDashboard />
        </MockedProvider>
      </Provider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});