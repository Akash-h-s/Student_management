export type UploadType = 'student' | 'teacher';
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface WorkflowStatus {
    workflowId: string;
    status: 'running' | 'completed' | 'failed';
    recordsProcessed?: number;
    emailsSent?: number;
    emailsFailed?: number;
    currentStep?: string;
    progress?: number;
}
