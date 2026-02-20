import { GRADE_THRESHOLDS } from './constants';
import type { Subject, Student, MarkEntry } from './types';

export const parseTeacherId = (id: string | number | undefined): number | null => {
    if (!id) return null;
    return typeof id === 'number' ? id : parseInt(id, 10);
};

export const getCurrentYear = (): string => new Date().getFullYear().toString();

export const calculateGrade = (marks: number): string => GRADE_THRESHOLDS.find(({ threshold }) => marks >= threshold)?.grade || 'F';

export const getGradeColorClass = (grade: string): string => GRADE_THRESHOLDS.find((g) => g.grade === grade)?.colorClass || 'bg-gray-100 text-gray-800';

// Normalize subject name (case-insensitive matching)
export const normalizeSubjectName = (name: string): string => name.toLowerCase().trim();

export const findSimilarSubject = (inputName: string, subjects: Subject[]): Subject | undefined => {
    const normalized = normalizeSubjectName(inputName);
    return subjects.find(s => normalizeSubjectName(s.name) === normalized);
};

export const initializeMarksData = (students: Student[]): Record<number, MarkEntry> => {
    const initialMarks: Record<number, MarkEntry> = {};
    students.forEach((student) => {
        initialMarks[student.id] = { student_id: student.id, marks_obtained: '', grade: '', remarks: '' };
    });
    return initialMarks;
};
