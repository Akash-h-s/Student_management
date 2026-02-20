import React, { useMemo } from 'react';
import type { Mark } from '../types';
import { calculateTotalMarks } from '../utils';

interface ExamSummaryProps {
    marks: Mark[];
    onPrintMarkscard: () => void;
    isGenerating: boolean;
}

export const ExamSummary = React.memo(({ marks, onPrintMarkscard, isGenerating }: ExamSummaryProps) => {
    const { total, max, percentage } = useMemo(() => calculateTotalMarks(marks), [marks]);

    return (
        <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded">
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-3">
                <div className="text-xs md:text-sm">
                    <span className="font-semibold">Total Subjects:</span> {marks.length}
                </div>
                <div className="text-xs md:text-sm">
                    <span className="font-semibold">Total Marks:</span> {total} / {max}
                </div>
                <div className="text-xs md:text-sm">
                    <span className="font-semibold">Overall Percentage:</span> {percentage}%
                </div>
            </div>
            <button onClick={onPrintMarkscard} disabled={isGenerating} className="w-full mt-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 md:h-5 w-4 md:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                </svg>
                <span>{isGenerating ? 'Generating...' : 'Print Markscard'}</span>
            </button>
        </div>
    );
});
ExamSummary.displayName = 'ExamSummary';
