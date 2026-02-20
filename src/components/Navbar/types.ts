import type { LucideIcon } from 'lucide-react';

export type Role = 'student' | 'parent' | 'teacher' | 'admin';

export interface NavLink {
    to: string;
    label: string;
    icon?: LucideIcon;
}

export interface UserInfo {
    name: string;
    email: string;
    role: Role;
}
