import { User, MessageCircle } from 'lucide-react';
import type { Feature, AccessItem } from './types';

export const FEATURES: Feature[] = [
    {
        title: 'Student Details',
        description: "View your child's academic information",
        icon: User,
        link: '/parent/student-details',
        color: 'bg-green-500',
    },
    {
        title: 'Messages',
        description: 'Chat with teachers and view groups',
        icon: MessageCircle,
        link: '/parent/chat',
        color: 'bg-blue-500',
    },
];

export const ACCESS_ITEMS: AccessItem[] = [
    { text: "View your child's academic details" },
    { text: 'Check marks and performance' },
    { text: 'Communicate with teachers' },
    { text: 'View group messages and announcements' },
];

export const STYLES = {
    card: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
    iconContainer: 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
    icon: 'w-6 h-6 text-white',
    title: 'text-xl font-semibold text-gray-900 mb-2',
    description: 'text-gray-600',
    bullet: 'w-2 h-2 bg-green-500 rounded-full',
} as const;
