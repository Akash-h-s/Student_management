import { FileText, MessageCircle } from 'lucide-react';
import type { Feature, Responsibility } from './types';

export const FEATURES: Feature[] = [
    {
        title: 'Marks Entry',
        description: 'Enter and manage student marks',
        icon: FileText,
        link: '/teacher/marks-entry',
        color: 'bg-purple-500',
    },
    {
        title: 'Messages',
        description: 'Chat with parents and create groups',
        icon: MessageCircle,
        link: '/teacher/chat',
        color: 'bg-indigo-500',
    },
];

export const RESPONSIBILITIES: Responsibility[] = [
    { text: 'Enter and manage student marks' },
    { text: 'Communicate with parents via messaging' },
    { text: 'Create and manage parent groups' },
];

export const STYLES = {
    card: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
    iconContainer: 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
    icon: 'w-6 h-6 text-white',
    title: 'text-xl font-semibold text-gray-900 mb-2',
    description: 'text-gray-600',
    bullet: 'w-2 h-2 bg-purple-500 rounded-full',
} as const;
