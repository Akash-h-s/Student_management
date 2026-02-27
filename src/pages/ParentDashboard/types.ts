import type { LucideIcon } from 'lucide-react';

export interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
    link: string;
    color: string;
}

export interface AccessItem {
    text: string;
}
