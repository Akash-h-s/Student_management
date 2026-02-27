import { Building2, Mail, Lock, Phone } from 'lucide-react';
import type { FormData, FormFieldConfig } from './types';

export const INITIAL_FORM_STATE: FormData = {
    schoolName: '',
    email: '',
    password: '',
    phone: '',
};

export const FORM_FIELDS: FormFieldConfig[] = [
    {
        name: 'schoolName',
        label: 'School Name',
        type: 'text',
        placeholder: 'Enter school name',
        icon: Building2,
    },
    {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'admin@school.com',
        icon: Mail,
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Min. 8 chars, alphanumeric',
        icon: Lock,
    },
    {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter phone number',
        icon: Phone,
    },
];

export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    minPhoneLength: 10,
};

export const ERROR_MESSAGES = {
    schoolName: 'School name is required',
    email: 'Please enter a valid email address',
    emailExists: 'Email already registered',
    password: 'Password must be at least 8 characters with letters and numbers',
    phone: 'Please enter a valid phone number',
    signupFailed: (message: string) => `Signup failed: ${message}`,
};

export const SUCCESS_MESSAGES = {
    signupSuccess: 'Signup successful!',
};

export const ROUTES = {
    login: '/login',
    adminDashboard: '/admin/dashboard',
};
