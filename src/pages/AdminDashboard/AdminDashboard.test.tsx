import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import AdminDashboard from './AdminDashboard';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

describe('AdminDashboard Component', () => {
  it('1. should display personalized welcome message with user name', () => {
    const store = createMockStore({
      user: { name: 'Principal Smith', role: 'admin' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Welcome back, Principal Smith!/i)).toBeDefined();
  });

  it('2. should render all administrative feature cards', () => {
    const store = createMockStore({
      user: { name: 'Admin', role: 'admin' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Upload Student Data')).toBeDefined();
    expect(screen.getByText('Upload Teacher Data')).toBeDefined();
  });

  it('3. should have correct navigation links on feature cards', () => {
    const store = createMockStore({
      user: { name: 'Admin', role: 'admin' },
      isAuthenticated: true
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    const studentCard = screen.getByRole('link', { name: /Upload Student Data/i });
    expect(studentCard.getAttribute('href')).toBe('/admin/upload');
  });

  it('4. should handle cases where user name might be missing gracefully', () => {
    const store = createMockStore({
      user: null,
      isAuthenticated: false
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    // Should render "Welcome back, !" or similar without crashing
    expect(screen.getByText(/Welcome back,/i)).toBeDefined();
  });
});