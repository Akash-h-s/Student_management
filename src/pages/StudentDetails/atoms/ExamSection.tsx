import React from 'react';
import type { Mark } from '../types';
import { TABLE_HEADERS, STYLES } from '../constants';
import { MarkRow } from './MarkRow';
import { ExamSummary } from './ExamSummary';

interface ExamSectionProps {
    examName: string;
    marks: Mark[];
    onPrintMarkscard: () => void;
    isGenerating: boolean;
}

export const ExamSection = React.memo(({ examName, marks, onPrintMarkscard, isGenerating }: ExamSectionProps) => (
    <div className="border rounded-lg p-3 md:p-4">
        <h4 className="text-base md:text-lg font-semibold text-blue-600 mb-3">{examName}</h4>

        <div className="overflow-x-auto -mx-3 md:mx-0">
            <table className={`${STYLES.table} min-w-[700px] md:min-w-full`}>
                <thead className="bg-gray-50">
                    <tr>
                        {TABLE_HEADERS.map((header) => (
                            <th key={header} className={STYLES.tableHeader}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {marks.map((mark) => (
                        <MarkRow key={mark.id} mark={mark} />
                    ))}
                </tbody>
            </table>
        </div>

        <ExamSummary marks={marks} onPrintMarkscard={onPrintMarkscard} isGenerating={isGenerating} />
    </div>
));
ExamSection.displayName = 'ExamSection';
