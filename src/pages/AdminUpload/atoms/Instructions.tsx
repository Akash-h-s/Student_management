import React from 'react';
import { FileText } from 'lucide-react';
import { INSTRUCTIONS } from '../constants';

export const Instructions = React.memo(() => (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload Instructions:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            {INSTRUCTIONS.map((instruction, index) => (
                <li key={index}>{instruction}</li>
            ))}
        </ul>
    </div>
));
Instructions.displayName = 'Instructions';
