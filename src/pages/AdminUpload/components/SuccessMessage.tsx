import React from 'react';
import { CheckCircle } from 'lucide-react';
import type{ WorkflowStatus } from '../types';

interface SuccessMessageProps {
    message: string;
    workflowStatus: WorkflowStatus | null;
    onReset: () => void;
}

export const SuccessMessage = React.memo(({ message, onReset }: SuccessMessageProps) => (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Upload Successful!</p>
                <p className="text-sm text-green-700 mt-1">{message}</p>
            </div>
        </div>
        <button
            onClick={onReset}
            className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
            Upload Another File
        </button>
    </div>
));
SuccessMessage.displayName = 'SuccessMessage';
