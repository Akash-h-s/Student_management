import React, { useMemo, useState, useCallback } from 'react';
import type { Mark } from '../types';
import { calculateTotalMarks, calculatePercentage } from '../utils';
import { generateAISummary } from '../../../services/aiService';
import AISummaryPanel from '../../../components/AI/AISummaryPanel';
import type { AISummaryData } from '../../../components/AI/types';

interface ExamSummaryProps {
    marks: Mark[];
    examName: string;
    studentName: string;
    admissionNo: string;
    schoolName: string;
    onPrintMarkscard: () => void;
    isGenerating: boolean;
}

export const ExamSummary = React.memo(({ marks, examName, studentName, admissionNo, schoolName, onPrintMarkscard, isGenerating }: ExamSummaryProps) => {
    const { total, max, percentage } = useMemo(() => calculateTotalMarks(marks), [marks]);

    const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        setAiLoading(true);
        setAiError(null);
        setShowSummary(true);

        try {
            const markscardData = {
                student_name: studentName,
                admission_no: admissionNo,
                exam_name: examName,
                school_name: schoolName || 'ACADEMIC INSTITUTION',
                school_address: '',
                school_phone: '',
                school_logo_url: '',
                marks: marks.map((m) => ({
                    subject: m.subject.name,
                    marks_obtained: m.marks_obtained,
                    max_marks: m.max_marks,
                    grade: m.grade,
                    percentage: calculatePercentage(m.marks_obtained, m.max_marks),
                    remarks: m.remarks,
                })),
                total_marks: total,
                max_marks: max,
                overall_percentage: percentage,
                date: new Date().toLocaleDateString(),
            };

            const summary = await generateAISummary(markscardData);
            setAiSummary(summary);
        } catch (err: any) {
            setAiError(err.message || 'Failed to generate AI summary');
        } finally {
            setAiLoading(false);
        }
    }, [marks, examName, studentName, admissionNo, schoolName, total, max, percentage]);

    return (
        <div>
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
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={onPrintMarkscard} disabled={isGenerating} className="flex-1 mt-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
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
                    <button
                        onClick={handleGenerateSummary}
                        disabled={aiLoading}
                        className="flex-1 mt-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                        <svg className="h-4 md:h-5 w-4 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        <span>{aiLoading ? 'Analyzing...' : '✨ AI Summary'}</span>
                    </button>
                </div>
            </div>

            {showSummary && (
                <AISummaryPanel
                    isLoading={aiLoading}
                    summary={aiSummary}
                    error={aiError}
                    onClose={() => { setShowSummary(false); setAiSummary(null); setAiError(null); }}
                />
            )}
        </div>
    );
});
ExamSummary.displayName = 'ExamSummary';
