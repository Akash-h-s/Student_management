import React from 'react';
import { Loader2, Clock } from 'lucide-react';

interface WorkflowProgressProps {
    workflowId: string;
    progress: number;
    currentStep: string;
}

export const WorkflowProgress = React.memo(({ workflowId, progress, currentStep }: WorkflowProgressProps) => (
    <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Processing Workflow</p>
                <p className="text-xs text-blue-600 font-mono">ID: {workflowId}</p>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
        </div>

        {/* Current Step */}
        {currentStep && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 mt-0.5 text-blue-500" />
                <span>{currentStep}</span>
            </div>
        )}
    </div>
));
WorkflowProgress.displayName = 'WorkflowProgress';
