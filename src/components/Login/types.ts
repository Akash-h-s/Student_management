export type Role = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface RoleConfig {
    requiresPassword: boolean;
    identifierLabel: string;
    identifierType: 'text' | 'email';
    route: string;
}
