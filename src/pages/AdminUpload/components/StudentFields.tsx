import React from 'react';

interface StudentFieldsProps {
    studentClass: string;
    studentSection: string;
    onClassChange: (value: string) => void;
    onSectionChange: (value: string) => void;
    disabled: boolean;
}

export const StudentFields = React.memo(({ studentClass, studentSection, onClassChange, onSectionChange, disabled }: StudentFieldsProps) => (
    <div className="mb-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Class <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                placeholder="Enter Class (e.g. 10)"
                value={studentClass}
                onChange={(e) => onClassChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            />
        </div>
        <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Section <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                placeholder="Enter Section (e.g. A)"
                value={studentSection}
                onChange={(e) => onSectionChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-3 sm:px-4 sm:py-2.5 text-base sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
            />
        </div>
    </div>
));
StudentFields.displayName = 'StudentFields';
