import React, { useMemo } from 'react';
import { MESSAGES, STYLES } from '../constants';
import { groupMarksByExam } from '../utils';
import type { Student, Mark } from '../types';
import { SchoolInfo } from './SchoolInfo';
import { ExamSection } from './ExamSection';

interface StudentCardProps {
    student: Student;
    onPrintMarkscard: (student: Student, marks: Mark[], examName: string) => void;
    isGenerating: boolean;
}

export const StudentCard = React.memo(({ student, onPrintMarkscard, isGenerating }: StudentCardProps) => {
    const groupedMarks = useMemo(() => groupMarksByExam(student.marks), [student.marks]);

    return (
        <div className={`${STYLES.card} mb-6`}>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{student.name}</h2>
                        <p className="text-sm md:text-base text-gray-600">Admission No: {student.admission_no}</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <SchoolInfo adminId={student.created_by_admin_id} />
                    </div>
                </div>
            </div>

            <h3 className="text-lg md:text-xl font-semibold mb-4">Academic Performance</h3>

            {student.marks && student.marks.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedMarks).map(([examName, marks]) => (
                        <ExamSection
                            key={examName}
                            examName={examName}
                            marks={marks}
                            onPrintMarkscard={() => onPrintMarkscard(student, marks, examName)}
                            isGenerating={isGenerating}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">{MESSAGES.NO_MARKS}</p>
            )}
        </div>
    );
});
StudentCard.displayName = 'StudentCard';
