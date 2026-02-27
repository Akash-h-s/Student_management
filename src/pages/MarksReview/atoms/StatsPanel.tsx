import React from 'react';

interface MarksStats {
    filled: number;
    pending: number;
    total: number;
}

interface StatsPanelProps {
    stats: MarksStats;
}

export const StatsPanel = React.memo(({ stats }: StatsPanelProps) => (
    <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.filled}</div>
            <div className="text-sm text-gray-600">Marks Filled</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Students</div>
        </div>
    </div>
));
StatsPanel.displayName = 'StatsPanel';
