import  type{ FC } from 'react';
import { Edit2, Save } from 'lucide-react';
import { TABLE_HEADERS, MAX_MARKS, BUTTON_STYLES } from '../constants';
import type { Student, MarkEntry } from '../types';
import { StudentRow } from './StudentRow';

interface MarksTableProps {
    students: Student[];
    marksData: Record<number, MarkEntry>;
    existingMarksMap: Record<number, any>;
    isEditMode: boolean;
    pendingStudentsCount: number;
    saving: boolean;
    canSave: boolean;

    handleMarksChange: (studentId: number, marks: string) => void;
    handleRemarksChange: (studentId: number, remarks: string) => void;
    handleSaveMarks: () => void;
}

export const MarksTable: FC<MarksTableProps> = ({
    students,
    marksData,
    existingMarksMap,
    isEditMode,
    pendingStudentsCount,
    saving,
    canSave,
    handleMarksChange,
    handleRemarksChange,
    handleSaveMarks
}) => {
    if (students.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isEditMode && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Edit Mode - Updating existing marks</span>
                </div>
            )}
            {pendingStudentsCount > 0 && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-yellow-700">⚠️ {pendingStudentsCount} student(s) with pending marks</span>
                    <span className="text-xs text-yellow-600">Click on Pending rows to enter marks</span>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full table-auto">
                    <thead className="bg-gray-100 border-b">
                        <tr>{TABLE_HEADERS.map(h => <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map((s, i) => (
                            <StudentRow
                                key={s.id}
                                student={s}
                                index={i}
                                markData={marksData[s.id]}
                                maxMarks={MAX_MARKS}
                                onMarksChange={handleMarksChange}
                                onRemarksChange={handleRemarksChange}
                                isEditing={!!existingMarksMap[s.id]}
                                isPending={!marksData[s.id]?.marks_obtained}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
                <button onClick={handleSaveMarks} disabled={!canSave || saving} className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium ${canSave && !saving ? BUTTON_STYLES.primary : BUTTON_STYLES.disabled}`}>
                    <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Marks'}
                </button>
            </div>
        </div>
    );
};
