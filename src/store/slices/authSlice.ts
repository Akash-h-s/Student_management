import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

export type Role = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    isAuthenticated: false,
    token: null,
};

interface JWTPayload {
    id?: number;
    name?: string;
    email?: string;
    sub?: string;
    role?: Role;
    'https://hasura.io/jwt/claims'?: {
        'x-hasura-user-id'?: string;
        'x-hasura-default-role'?: string;
        'x-hasura-user-name'?: string;
        'x-hasura-user-email'?: string;
    };
    exp?: number;
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.loading = false;

            // Side effects (localStorage) should ideally be in a middleware or thunk, 
            // but for simplicity/direct migration we can keep them in the caller or use a thunk.
            // Here we just update state.
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        initializeAuth: (state) => {
            // This is just to signal initialization start if needed
            state.loading = true;
        }
    },
});

export const { setLoading, loginSuccess, logoutSuccess, initializeAuth } = authSlice.actions;

// Thunk to handle login logic including decoding and storage
export const loginUser = (token: string) => (dispatch: any) => {
    try {
        if (!token) {
            throw new Error('No token provided');
        }

        if (token.split('.').length !== 3) {
            throw new Error('Structural mismatch: Not a 3-part JWT');
        }

        const decoded = jwtDecode<JWTPayload>(token);

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error('Token Expired');
        }

        const claims = decoded['https://hasura.io/jwt/claims'];
        const role = (decoded.role || claims?.['x-hasura-default-role']) as Role;
        const userId = decoded.id || decoded.sub || claims?.['x-hasura-user-id'];

        if (!role || !userId) {
            throw new Error('Essential claims missing');
        }

        const user: User = {
            id: Number(userId),
            name: decoded.name || claims?.['x-hasura-user-name'] || 'User',
            email: decoded.email || claims?.['x-hasura-user-email'] || '',
            role: role,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch(loginSuccess({ user, token }));
    } catch (error) {
        console.error('Login failed:', error);
        dispatch(logoutUser());
    }
};

export const logoutUser = () => (dispatch: any) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logoutSuccess());
    // Optional: Redirect logic if needed, but components usually handle redirection based on auth state
};

export const checkAuthFromStorage = () => (dispatch: any) => {
    const token = localStorage.getItem('token');
    if (token) {
        dispatch(loginUser(token));
    } else {
        dispatch(setLoading(false));
    }
};

export default authSlice.reducer;
