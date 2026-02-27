import React from 'react';

interface AlertBoxProps {
    type: 'info' | 'success' | 'error' | 'warning';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const AlertBox = React.memo(({ type, icon, children }: AlertBoxProps) => {
    const colors = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    return (
        <div className={`mb-4 p-3 border rounded-md flex items-center gap-2 ${colors[type]}`}>
            {icon}
            <span className="text-sm">{children}</span>
        </div>
    );
});
AlertBox.displayName = 'AlertBox';
