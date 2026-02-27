import React from 'react';
import { MESSAGES } from '../constants';

export const LoadingSpinner = React.memo(() => (
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
));
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingStateProps {
    message?: string;
}

export const LoadingState = React.memo(({ message = MESSAGES.LOADING }: LoadingStateProps) => (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600">{message}</p>
        </div>
    </div>
));
LoadingState.displayName = 'LoadingState';
