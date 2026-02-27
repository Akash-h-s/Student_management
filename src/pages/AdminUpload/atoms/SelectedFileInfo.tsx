import React from 'react';
import { FileText } from 'lucide-react';

interface SelectedFileInfoProps {
    file: File;
    onRemove: () => void;
    isProcessing: boolean;
}

export const SelectedFileInfo = React.memo(({ file, onRemove, isProcessing }: SelectedFileInfoProps) => (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="flex-1">
                <p className="text-sm font-medium text-green-800">File Ready</p>
                <p className="text-xs text-green-600">{file.name}</p>
            </div>
            {!isProcessing && (
                <button
                    onClick={onRemove}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Remove
                </button>
            )}
        </div>
    </div>
));
SelectedFileInfo.displayName = 'SelectedFileInfo';
