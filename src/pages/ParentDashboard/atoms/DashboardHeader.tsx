import React from 'react';

interface DashboardHeaderProps {
    userName?: string;
}

export const DashboardHeader = React.memo(({ userName }: DashboardHeaderProps) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {userName}!</p>
    </div>
));
DashboardHeader.displayName = 'DashboardHeader';
