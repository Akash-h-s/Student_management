import { API_BASE_URL } from '../config/api';

interface SignupData {
    schoolName: string;
    email: string;
    password: string;
    phone: string;
}

interface LoginData {
    role: string;
    identifier: string;
    password?: string;
    studentName?: string;
}



interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

export const authService = {
    async signup(data: SignupData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/hasura/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Signup failed');
        }

        return result;
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/hasura/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        return result;
    },
};
