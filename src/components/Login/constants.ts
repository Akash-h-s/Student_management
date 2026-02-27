import type { Role, RoleConfig } from './types';

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
    student: {
        requiresPassword: false,
        identifierLabel: 'Admission Number',
        identifierType: 'text',
        route: '/student/dashboard',
    },
    parent: {
        requiresPassword: true,
        identifierLabel: 'Email Address',
        identifierType: 'email',
        route: '/parent/dashboard',
    },
    teacher: {
        requiresPassword: true,
        identifierLabel: 'Email Address',
        identifierType: 'email',
        route: '/teacher/dashboard',
    },
    admin: {
        requiresPassword: true,
        identifierLabel: 'Email Address',
        identifierType: 'email',
        route: '/admin/dashboard',
    },
};

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Admin' },
];

export const ERROR_MESSAGES = {
    IDENTIFIER_REQUIRED: (role: Role) =>
        `Please enter your ${ROLE_CONFIG[role].identifierLabel}`,
    PASSWORD_REQUIRED: (role: Role) => `${role} password is required`,
    STUDENT_NAME_REQUIRED: 'Student name is required',
    USER_NOT_FOUND: (role: Role) => `${role} not found with provided credentials`,
    INVALID_PASSWORD: 'Invalid password',
    LOGIN_FAILED: (message: string) => `Login failed: ${message}`,
};
