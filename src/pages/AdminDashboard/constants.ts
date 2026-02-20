import { Upload, Users } from 'lucide-react';
import type { Feature } from './types';

export const FEATURES: Feature[] = [
    {
        title: 'Upload Student Data',
        description: 'Upload student lists via Excel or PDF',
        icon: Upload,
        link: '/admin/upload',
        color: 'bg-blue-500',
    },
    {
        title: 'Upload Teacher Data',
        description: 'Upload teacher lists via Excel or PDF',
        icon: Users,
        link: '/admin/upload',
        color: 'bg-green-500',
    },
];
