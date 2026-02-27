import React from 'react';
import { STYLES, BUTTON_STYLES } from '../constants';

interface ErrorStateProps {
    title: string;
    message: string;
    onRetry?: () => void;
    additionalInfo?: string;
}

export const ErrorState = React.memo(({ title, message, onRetry, additionalInfo }: ErrorStateProps) => (
    <div className="min-h-screen bg-gray-100 p-8">
        <div className={`max-w-4xl mx-auto ${STYLES.card}`}>
            <div className="text-center text-red-600">
                <p className="text-xl font-semibold mb-2">{title}</p>
                <p>{message}</p>
                {additionalInfo && <p className="text-sm text-gray-500 mt-2">{additionalInfo}</p>}
                {onRetry && (
                    <button onClick={onRetry} className={`mt-4 ${BUTTON_STYLES.primary}`}>
                        Retry
                    </button>
                )}
            </div>
        </div>
    </div>
));
ErrorState.displayName = 'ErrorState';
