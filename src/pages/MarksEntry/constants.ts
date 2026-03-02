import type { GradeConfig } from './types';

export const MAX_MARKS = 100;
export const TEST_TYPES = ['FA1', 'FA2', 'FA3', 'FA4', 'Mid-term Exam', 'Final Exam'] as const;

export const GRADE_THRESHOLDS: GradeConfig[] = [
    { threshold: 90, grade: 'A+', colorClass: 'bg-green-100 text-green-800' },
    { threshold: 80, grade: 'A', colorClass: 'bg-green-100 text-green-800' },
    { threshold: 70, grade: 'B+', colorClass: 'bg-blue-100 text-blue-800' },
    { threshold: 60, grade: 'B', colorClass: 'bg-blue-100 text-blue-800' },
    { threshold: 50, grade: 'C', colorClass: 'bg-yellow-100 text-yellow-800' },
    { threshold: 40, grade: 'D', colorClass: 'bg-orange-100 text-orange-800' },
    { threshold: 0, grade: 'F', colorClass: 'bg-red-100 text-red-800' },
] as const;

export const ERROR_MESSAGES = {
    NOT_AUTHENTICATED: 'Teacher not authenticated. Please log in.',
    LOGIN_REQUIRED: 'Teacher ID not found. Please log in again.',
    CLASS_SECTION_REQUIRED: 'Please enter both class and section',
    ALL_FIELDS_REQUIRED: 'Please fill all required fields',
    NO_MARKS_ENTERED: 'Please enter marks for at least one student',
    SUBJECT_FAILED: 'Failed to create/fetch subject',
    EXAM_FAILED: 'Failed to create/fetch exam',
    SAVE_FAILED: 'Failed to save marks: ',
    FETCH_FAILED: 'Failed to fetch students. Please check your connection.',
} as const;

export const PLACEHOLDERS = {
    CLASS: 'e.g., 10',
    SECTION: 'e.g., A',
    SUBJECT: 'Select or create subject',
    EXAM: 'e.g., Mid Term Exam',
    ACADEMIC_YEAR: 'e.g., 2024-25',
    MARKS: '0',
    REMARKS: 'Optional',
} as const;

export const TABLE_HEADERS = ['S.No', 'Admission No', 'Student Name', `Marks (/${MAX_MARKS})`, 'Grade', 'Remarks'] as const;
export const BUTTON_STYLES = { primary: 'bg-blue-600 text-white hover:bg-blue-700', disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed' } as const;
