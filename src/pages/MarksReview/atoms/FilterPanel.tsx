import React from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface FilterPanelProps {
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    onChangeClass: (value: string) => void;
    onChangeSection: (value: string) => void;
    onChangeExam: (value: string) => void;
    onChangeSubject: (value: string) => void;
    onLoadMarks: () => void;
    loading: boolean;
    errorMessage: string;
    successMessage: string;
}

export const FilterPanel = React.memo(({
    className,
    sectionName,
    examName,
    subjectName,
    onChangeClass,
    onChangeSection,
    onChangeExam,
    onChangeSubject,
    onLoadMarks,
    loading,
    errorMessage,
    successMessage
}: FilterPanelProps) => (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
                type="text"
                placeholder="Class (e.g., 10)"
                value={className}
                onChange={(e) => onChangeClass(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
                type="text"
                placeholder="Section (e.g., A)"
                value={sectionName}
                onChange={(e) => onChangeSection(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
                type="text"
                placeholder="Exam (e.g., FA1)"
                value={examName}
                onChange={(e) => onChangeExam(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
                type="text"
                placeholder="Subject"
                value={subjectName}
                onChange={(e) => onChangeSubject(e.target.value)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
        </div>

        <button
            onClick={onLoadMarks}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
            <Search className="w-4 h-4" /> {loading ? 'Loading...' : 'Load Class Marks'}
        </button>

        {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {errorMessage}
            </div>
        )}
        {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                {successMessage}
            </div>
        )}
    </div>
));
FilterPanel.displayName = 'FilterPanel';
