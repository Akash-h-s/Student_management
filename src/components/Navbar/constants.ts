import {
    LayoutDashboard,
    Upload,
    FileText,
    MessageCircle,
    User
} from 'lucide-react';
import type { NavLink, Role } from './types';

export const PUBLIC_NAV_LINKS: NavLink[] = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/helpus', label: 'Help' },
];

export const ROLE_NAV_LINKS: Record<Role, NavLink[]> = {
    admin: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/upload', label: 'Upload Data', icon: Upload },
    ],
    teacher: [
        { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/teacher/marks-entry', label: 'Marks Entry', icon: FileText },
        { to: '/teacher/chat', label: 'Messages', icon: MessageCircle },
    ],
    parent: [
        { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/parent/student-details', label: 'Student Details', icon: User },
        { to: '/parent/chat', label: 'Messages', icon: MessageCircle },
    ],
    student: [
        { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
};
