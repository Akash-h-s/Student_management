import React from 'react';
import { Check, AlertCircle, Edit2, Download } from 'lucide-react';
import { getGradeColorClass } from '../utils';
import type { Student, Mark } from '../types';

interface MarksTableProps {
    students: Student[];
    marksMap: Record<number, Partial<Mark>>;
    editingCell: string | null;
    saving: boolean;
    marksStats: { pending: number; total: number };
    onCellChange: (studentId: number, value: string) => void;
    onCellFocus: (studentId: number) => void;
    onCellBlur: () => void;
    onBulkUpdate: () => void;
}

export const MarksTable = React.memo(({
    students,
    marksMap,
    editingCell,
    saving,
    marksStats,
    onCellChange,
    onCellFocus,
    onCellBlur,
    onBulkUpdate
}: MarksTableProps) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admission No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {students.map((student, idx) => {
                        const mark = marksMap[student.id];
                        const hasMarks = mark?.marks_obtained !== undefined;
                        return (
                            <tr key={student.id} className={hasMarks ? 'bg-green-50' : 'bg-red-50'}>
                                <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={mark?.marks_obtained ?? ''}
                                        onChange={(e) => onCellChange(student.id, e.target.value)}
                                        onFocus={() => onCellFocus(student.id)}
                                        onBlur={onCellBlur}
                                        className={`w-20 px-2 py-1 border rounded ${editingCell === `${student.id}` ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                                            } focus:outline-none`}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColorClass(mark?.grade || 'F')}`}>
                                        {mark?.grade || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {hasMarks ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                            <Check className="w-4 h-4" /> Done
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                            <AlertCircle className="w-4 h-4" /> Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t flex gap-2 justify-end">
            <button
                onClick={onBulkUpdate}
                disabled={saving || marksStats.pending === marksStats.total}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
                <Edit2 className="w-4 h-4" /> {saving ? 'Saving...' : 'Update All Marks'}
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Excel
            </button>
        </div>
    </div>
));
MarksTable.displayName = 'MarksTable';
