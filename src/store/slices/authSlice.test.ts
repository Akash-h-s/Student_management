import { describe, it, expect, vi } from 'vitest';
import authReducer, { loginSuccess, logoutSuccess, loginUser, User } from './authSlice'; // Adjust imports based on your exports
import { configureStore } from '@reduxjs/toolkit';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn((token) => {
        if (token === 'valid-token.part2.part3') {
            return {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'student',
                exp: Date.now() / 1000 + 3600
            };
        } else if (token === 'expired-token.part2.part3') {
            return {
                exp: Date.now() / 1000 - 3600
            };
        }
        throw new Error('Invalid token');
    }),
}));

describe('authSlice', () => {

    it('should handle initial state', () => {
        const initialState = {
            user: null,
            loading: true,
            isAuthenticated: false,
            token: null,
        };
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle loginSuccess', () => {
        const user: User = { id: 1, name: 'Test', email: 'test@test.com', role: 'student' };
        const actual = authReducer(undefined, loginSuccess({ user, token: 'abc' }));
        expect(actual.user).toEqual(user);
        expect(actual.isAuthenticated).toBe(true);
        expect(actual.loading).toBe(false);
    });

    it('should handle logoutSuccess', () => {
        const user: User = { id: 1, name: 'Test', email: 'test@test.com', role: 'student' };
        const startState = {
            user,
            token: 'abc',
            isAuthenticated: true,
            loading: false
        };
        const actual = authReducer(startState, logoutSuccess());
        expect(actual.user).toBeNull();
        expect(actual.isAuthenticated).toBe(false);
    });

    it('loginUser thunk should dispatch loginSuccess on valid token', () => {
        const store = configureStore({ reducer: { auth: authReducer } });
        store.dispatch(loginUser('valid-token.part2.part3'));

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(true);
        if (state.user) {
            expect(state.user.name).toBe('Test User');
        } else {
            throw new Error('User should not be null');
        }
    });

    it('loginUser thunk should dispatch logoutSuccess on error', () => {
        const store = configureStore({ reducer: { auth: authReducer } });
        store.dispatch(loginUser('expired-token.part2.part3')); // Should fail validation or expiration

        const state = store.getState().auth;
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
