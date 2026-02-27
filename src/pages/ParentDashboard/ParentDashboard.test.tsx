import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import ParentDashboard from './ParentDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('ParentDashboard', () => {
  it('renders welcome message with parent name', () => {
    const store = createMockStore({
      user: { name: 'John Doe', role: 'parent' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ParentDashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Welcome back, John Doe!/i)).toBeDefined();
    expect(screen.getByText('Student Details')).toBeDefined();
    expect(screen.getByText('Messages')).toBeDefined();
  });
});