import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onReset: () => void;
}

export const ErrorMessage = React.memo(({ message, onReset }: ErrorMessageProps) => (
    <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Upload Failed</p>
                <p className="text-sm text-red-700 mt-1">{message}</p>
            </div>
        </div>
        <button
            onClick={onReset}
            className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
            Try Again
        </button>
    </div>
));
ErrorMessage.displayName = 'ErrorMessage';
