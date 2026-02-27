import React from 'react';
import { Edit2, AlertCircle } from 'lucide-react';
import { getGradeColorClass } from '../utils';
import type { Student, MarkEntry } from '../types';

interface StudentRowProps {
    student: Student;
    index: number;
    markData: MarkEntry;
    maxMarks: number;
    onMarksChange: (id: number, m: string) => void;
    onRemarksChange: (id: number, r: string) => void;
    isEditing?: boolean;
    isPending?: boolean;
}

export const StudentRow = React.memo(({
    student,
    index,
    markData,
    maxMarks,
    onMarksChange,
    onRemarksChange,
    isEditing,
    isPending
}: StudentRowProps) => (
    <tr className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${isPending ? 'bg-yellow-50' : ''}`}>
        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
        <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
            {student.name}
            {isEditing && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded"><Edit2 className="w-3 h-3" /> Edit</span>}
            {isPending && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded"><AlertCircle className="w-3 h-3" /> Pending</span>}
        </td>
        <td className="px-4 py-3">
            <input
                type="number"
                min="0"
                max={maxMarks}
                step="0.5"
                value={markData.marks_obtained}
                onChange={(e) => onMarksChange(student.id, e.target.value)}
                className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </td>
        <td className="px-4 py-3">
            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${getGradeColorClass(markData.grade)}`}>
                {markData.grade || '-'}
            </span>
        </td>
        <td className="px-4 py-3">
            <input
                type="text"
                value={markData.remarks}
                onChange={(e) => onRemarksChange(student.id, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </td>
    </tr>
));
StudentRow.displayName = 'StudentRow';
