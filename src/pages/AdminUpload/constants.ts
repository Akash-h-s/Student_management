export const API_BASE_URL = 'http://localhost:3000/hasura';
export const POLLING_INTERVAL_MS = 2000;

export const VALID_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
] as const;

export const STEP_PROGRESS_MAP: Record<string, number> = {
    'Parsing Excel file': 20,
    'Validating data': 40,
    'Creating database records': 60,
    'Sending emails': 80,
    'Finalizing': 95,
} as const;

export const UPLOAD_TYPE_OPTIONS = [
    { value: '', label: '-- Choose Type --' },
    { value: 'student', label: 'Student List' },
    { value: 'teacher', label: 'Teacher List' },
] as const;

export const INSTRUCTIONS = [
    'Select upload type (Student or Teacher)',
    'For students, provide class and section information',
    'Choose Excel (.xlsx, .xls) or PDF file',
    'Click "Start Upload" to begin the Temporal workflow',
    'Track real-time progress as data is processed',
    'Emails will be sent automatically upon completion',
] as const;

export const MESSAGES = {
    SELECT_FILE_AND_TYPE: 'Please select a file and upload type',
    PROVIDE_CLASS_SECTION: 'Please provide Class and Section for student list',
    INVALID_FILE_TYPE: 'Please select a PDF or Excel file',
    WORKFLOW_FAILED: '❌ Workflow failed. Please try again.',
    UPLOAD_FAILED: 'Upload failed: ',
} as const;
