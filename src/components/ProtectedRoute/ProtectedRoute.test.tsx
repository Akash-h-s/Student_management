import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';

const createMockStore = (initialState: any) => configureStore({
    reducer: {
        auth: authReducer,
    },
    preloadedState: {
        auth: initialState
    }
});

const renderWithRouterAndRedux = (ui: React.ReactElement, authState: any, initialRoute = '/protected') => {
    return render(
        <Provider store={createMockStore(authState)}>
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
                    <Route path="/teacher/dashboard" element={<div>Teacher Dashboard</div>} />
                    <Route path="/protected" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe('ProtectedRoute', () => {
    it('renders loading spinner when loading is true', () => {
        const { container } = renderWithRouterAndRedux(
            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
            { loading: true, user: null, isAuthenticated: false }
        );
        // The component renders a specific div structure for spinner: .animate-spin
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('redirects to /login when user is not authenticated', () => {
        renderWithRouterAndRedux(
            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
            { loading: false, user: null, isAuthenticated: false }
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when user has wrong role', () => {
        renderWithRouterAndRedux(
            <ProtectedRoute allowedRoles={['teacher']}><div>Protected Content</div></ProtectedRoute>,
            {
                loading: false,
                user: { id: 1, role: 'admin', name: 'Admin', email: 'admin@test.com' },
                isAuthenticated: true
            }
        );
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('renders children when user is authenticated and has correct role (no roles specified)', () => {
        // If no roles specified, any authenticated user should pass
        renderWithRouterAndRedux(
            <ProtectedRoute><div>Protected Content</div></ProtectedRoute>,
            {
                loading: false,
                user: { id: 1, role: 'student', name: 'Student', email: 'student@test.com' },
                isAuthenticated: true
            }
        );
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when user is authenticated and has correct role (specified)', () => {
        renderWithRouterAndRedux(
            <ProtectedRoute allowedRoles={['teacher']}><div>Protected Content</div></ProtectedRoute>,
            {
                loading: false,
                user: { id: 1, role: 'teacher', name: 'Teacher', email: 'teacher@test.com' },
                isAuthenticated: true
            }
        );
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
