export const API_BASE_URL = 'http://localhost:5000/api';
export const DEFAULT_SCHOOL_NAME = 'ACADEMIC INSTITUTION';

export const GRADE_COLORS: Record<string, string> = {
    'A+': 'bg-green-100 text-green-800',
    'A': 'bg-green-100 text-green-800',
    'B+': 'bg-blue-100 text-blue-800',
    'B': 'bg-blue-100 text-blue-800',
    'C': 'bg-yellow-100 text-yellow-800',
    'D': 'bg-orange-100 text-orange-800',
    'F': 'bg-red-100 text-red-800',
} as const;

export const DEFAULT_GRADE_COLOR = 'bg-red-100 text-red-800';

export const TABLE_HEADERS = [
    'Subject',
    'Marks Obtained',
    'Maximum Marks',
    'Percentage',
    'Grade',
    'Remarks',
] as const;

export const MESSAGES = {
    LOADING: 'Loading student details...',
    ERROR: 'Error',
    NOT_LOGGED_IN: 'Not Logged In',
    LOGIN_REQUIRED: 'Please log in to view student details.',
    NO_STUDENTS: 'No students found for your account.',
    NO_MARKS: 'No marks available yet.',
    GENERATING: 'Generating Markscard...',
    GENERATING_WAIT: 'Please wait while AI creates your markscard',
    SUCCESS: 'Markscard generated successfully!',
    FAILED: 'Failed to generate markscard. Please try again.',
} as const;

export const BUTTON_STYLES = {
    primary: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
    gradient: 'w-full mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

export const STYLES = {
    card: 'bg-white rounded-lg shadow-md p-4 md:p-6',
    table: 'min-w-full bg-white border',
    tableHeader: 'px-2 md:px-6 py-2 md:py-3 border-b text-left font-semibold text-xs md:text-sm',
    tableCell: 'px-2 md:px-6 py-2 md:py-4 border-b text-xs md:text-sm',
    tableRow: 'hover:bg-gray-50',
} as const;
