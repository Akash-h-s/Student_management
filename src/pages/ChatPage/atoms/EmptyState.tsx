import React from 'react';

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    subtitle?: string | null;
}

export const EmptyState = React.memo(({ icon: Icon, title, subtitle }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Icon className="w-16 h-16 mb-4" />
        <p className="text-center">{title}</p>
        {subtitle && <p className="text-sm text-center mt-2">{subtitle}</p>}
    </div>
));
EmptyState.displayName = 'EmptyState';
