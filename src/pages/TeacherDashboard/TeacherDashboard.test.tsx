import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import TeacherDashboard from './TeacherDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('TeacherDashboard', () => {
  it('renders teacher-specific features', () => {
    const store = createMockStore({
      user: { name: 'Prof. Snape', role: 'teacher' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeacherDashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Marks Entry')).toBeDefined();
    expect(screen.getByText(/Prof. Snape/i)).toBeDefined();
  });
});