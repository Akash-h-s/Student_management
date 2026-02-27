import { VALID_FILE_TYPES, STEP_PROGRESS_MAP } from './constants';
import type{ WorkflowStatus } from './types';

export const isValidFileType = (fileType: string): boolean => {
    return (VALID_FILE_TYPES as readonly string[]).includes(fileType);
};

export const getProgressFromStep = (step: string): number => {
    return STEP_PROGRESS_MAP[step] || 0;
};

export const formatSuccessMessage = (status: WorkflowStatus | null): string => {
    if (!status) return '';
    return `✅ Successfully processed ${status.recordsProcessed || 0} records.`;
};
