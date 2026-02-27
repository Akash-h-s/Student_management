import React from 'react';
import { Upload } from 'lucide-react';

export const Header = React.memo(() => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Upload className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Upload Portal</h1>
            <p className="text-gray-600 text-sm">Upload student and teacher data with Temporal workflows</p>
        </div>
    </div>
));
Header.displayName = 'Header';
