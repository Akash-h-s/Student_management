import React from 'react';
import { MESSAGES } from '../constants';
import { LoadingSpinner } from './LoadingState';

interface GeneratingOverlayProps {
    isGenerating: boolean;
}

export const GeneratingOverlay = React.memo(({ isGenerating }: GeneratingOverlayProps) => {
    if (!isGenerating) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-700 font-semibold">{MESSAGES.GENERATING}</p>
                <p className="text-gray-500 text-sm mt-2">{MESSAGES.GENERATING_WAIT}</p>
            </div>
        </div>
    );
});
GeneratingOverlay.displayName = 'GeneratingOverlay';
