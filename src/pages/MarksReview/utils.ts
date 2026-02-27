import { GRADE_THRESHOLDS } from './constants';

export const calculateGrade = (marks: number): string =>
    GRADE_THRESHOLDS.find(({ threshold }) => marks >= threshold)?.grade || 'F';

export const getGradeColorClass = (grade: string): string =>
    GRADE_THRESHOLDS.find((g) => g.grade === grade)?.colorClass || 'bg-gray-100 text-gray-800';
