import type { LucideIcon } from 'lucide-react';

export interface FormData {
    schoolName: string;
    email: string;
    password: string;
    phone: string;
}

export interface FormErrors {
    [key: string]: string;
}

export interface FormFieldConfig {
    name: keyof FormData;
    label: string;
    type: string;
    placeholder: string;
    icon: LucideIcon;
}
