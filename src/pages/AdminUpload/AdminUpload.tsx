// src/pages/AdminUpload.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

// ==================== TYPES ====================
type UploadType = 'student' | 'teacher';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface WorkflowStatus {
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  recordsProcessed?: number;
  emailsSent?: number;
  emailsFailed?: number;
  currentStep?: string;
  progress?: number;
}

// ==================== CONSTANTS ====================
const API_BASE_URL = 'http://localhost:3000/hasura';
const POLLING_INTERVAL_MS = 2000;

const VALID_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
] as const;

const STEP_PROGRESS_MAP: Record<string, number> = {
  'Parsing Excel file': 20,
  'Validating data': 40,
  'Creating database records': 60,
  'Sending emails': 80,
  'Finalizing': 95,
} as const;

const UPLOAD_TYPE_OPTIONS = [
  { value: '', label: '-- Choose Type --' },
  { value: 'student', label: 'Student List' },
  { value: 'teacher', label: 'Teacher List' },
] as const;

const INSTRUCTIONS = [
  'Select upload type (Student or Teacher)',
  'For students, provide class and section information',
  'Choose Excel (.xlsx, .xls) or PDF file',
  'Click "Start Upload" to begin the Temporal workflow',
  'Track real-time progress as data is processed',
  'Emails will be sent automatically upon completion',
] as const;

const MESSAGES = {
  SELECT_FILE_AND_TYPE: 'Please select a file and upload type',
  PROVIDE_CLASS_SECTION: 'Please provide Class and Section for student list',
  INVALID_FILE_TYPE: 'Please select a PDF or Excel file',
  WORKFLOW_FAILED: '❌ Workflow failed. Please try again.',
  UPLOAD_FAILED: 'Upload failed: ',
} as const;

// ==================== HELPER FUNCTIONS ====================
const isValidFileType = (fileType: string): boolean => {
  return VALID_FILE_TYPES.includes(fileType as any);
};

const getProgressFromStep = (step: string): number => {
  return STEP_PROGRESS_MAP[step] || 0;
};

const formatSuccessMessage = (status: WorkflowStatus | null): string => {
  if (!status) return '';
  return `✅ Successfully processed ${status.recordsProcessed || 0} records.`;
};

// ==================== MAIN COMPONENT ====================
export default function AdminUpload() {
  // State
  const [uploadType, setUploadType] = useState<UploadType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Refs
 const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ==================== WORKFLOW POLLING ====================
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const pollWorkflowStatus = useCallback(async (wfId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: wfId }),
      });

      if (!res.ok) return;

      const status: WorkflowStatus = await res.json();
      setWorkflowStatus(status);

      if (status.currentStep) {
        setCurrentStep(status.currentStep);
        setProgress(getProgressFromStep(status.currentStep));
      }

      if (status.status === 'completed') {
        setUploadStatus('success');
        setProgress(100);
        setCurrentStep('Upload completed successfully!');
        setMessage(formatSuccessMessage(status));
        stopPolling();
      } else if (status.status === 'failed') {
        setUploadStatus('error');
        setMessage(MESSAGES.WORKFLOW_FAILED);
        stopPolling();
      }
    } catch (err) {
      console.error('Error polling workflow status:', err);
    }
  }, [stopPolling]);

  const startPolling = useCallback((wfId: string) => {
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      pollWorkflowStatus(wfId);
    }, POLLING_INTERVAL_MS);
  }, [pollWorkflowStatus, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ==================== FILE HANDLING ====================
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isValidFileType(file.type)) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setMessage('');
    } else {
      alert(MESSAGES.INVALID_FILE_TYPE);
      e.target.value = '';
    }
  }, []);

  // ==================== UPLOAD HANDLING ====================
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !uploadType) {
      return alert(MESSAGES.SELECT_FILE_AND_TYPE);
    }

    if (uploadType === 'student' && (!studentClass.trim() || !studentSection.trim())) {
      return alert(MESSAGES.PROVIDE_CLASS_SECTION);
    }

    setLoading(true);
    setUploadStatus('uploading');
    setProgress(10);
    setCurrentStep('Uploading file to server...');

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];

        setCurrentStep('Starting workflow...');
        setProgress(15);

        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: uploadType,
            class: studentClass.trim(),
            section: studentSection.trim(),
            filename: selectedFile.name,
            fileBase64: base64
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Server Error');
        }

        setWorkflowId(data.workflowId);
        setUploadStatus('processing');
        setCurrentStep('Workflow started - processing your data...');
        startPolling(data.workflowId);

      } catch (err: any) {
        setMessage(MESSAGES.UPLOAD_FAILED + err.message);
        setUploadStatus('error');
        setProgress(0);
        setCurrentStep('');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  }, [selectedFile, uploadType, studentClass, studentSection, startPolling]);

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setStudentClass('');
    setStudentSection('');
    setUploadType('');
    setUploadStatus('idle');
    setMessage('');
    setWorkflowId(null);
    setWorkflowStatus(null);
    setProgress(0);
    setCurrentStep('');
    stopPolling();
  }, [stopPolling]);

  // ==================== MEMOIZED VALUES ====================
  const isProcessing = uploadStatus === 'processing';
  const isUploadDisabled = loading || !uploadType || !selectedFile || isProcessing;
  const showStudentFields = uploadType === 'student';

  const buttonClasses = useMemo(() => {
    if (loading || isProcessing) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (!uploadType || !selectedFile) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg';
  }, [loading, isProcessing, uploadType, selectedFile]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <Header />

          {/* Upload Type Selection */}
          <UploadTypeSelector
            value={uploadType}
            onChange={setUploadType}
            disabled={isProcessing}
          />

          {/* Student-specific fields */}
          {showStudentFields && (
            <StudentFields
              studentClass={studentClass}
              studentSection={studentSection}
              onClassChange={setStudentClass}
              onSectionChange={setStudentSection}
              disabled={isProcessing}
            />
          )}

          {/* File Upload */}
          <FileUploadInput
            onChange={handleFileChange}
            disabled={isProcessing}
          />

          {/* Selected File Info */}
          {selectedFile && (
            <SelectedFileInfo
              file={selectedFile}
              onRemove={() => setSelectedFile(null)}
              isProcessing={isProcessing}
            />
          )}

          {/* Workflow Progress */}
          {isProcessing && workflowId && (
            <WorkflowProgress
              workflowId={workflowId}
              progress={progress}
              currentStep={currentStep}
            />
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <SuccessMessage
              message={message}
              workflowStatus={workflowStatus}
              onReset={resetForm}
            />
          )}

          {uploadStatus === 'error' && (
            <ErrorMessage
              message={message}
              onReset={resetForm}
            />
          )}

          {/* Upload Button */}
          {uploadStatus !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={isUploadDisabled}
              className={`w-full py-3 rounded-lg font-medium transition-all ${buttonClasses}`}
            >
              {loading || isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Workflow...
                </span>
              ) : (
                'Start Upload'
              )}
            </button>
          )}

          {/* Instructions */}
          <Instructions />
        </div>
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================
const Header = React.memo(() => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
      <Upload className="w-6 h-6 text-white" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Upload Portal</h1>
      <p className="text-gray-600 text-sm">Upload student and teacher data with Temporal workflows</p>
    </div>
  </div>
));
Header.displayName = 'Header';

interface UploadTypeSelectorProps {
  value: UploadType | '';
  onChange: (value: UploadType | '') => void;
  disabled: boolean;
}

const UploadTypeSelector = React.memo(({ value, onChange, disabled }: UploadTypeSelectorProps) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Upload Category <span className="text-red-500">*</span>
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as UploadType | '')}
      disabled={disabled}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      {UPLOAD_TYPE_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
));
UploadTypeSelector.displayName = 'UploadTypeSelector';

interface StudentFieldsProps {
  studentClass: string;
  studentSection: string;
  onClassChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  disabled: boolean;
}

const StudentFields = React.memo(({ studentClass, studentSection, onClassChange, onSectionChange, disabled }: StudentFieldsProps) => (
  <div className="mb-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Class <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="Enter Class (e.g. 10)"
        value={studentClass}
        onChange={(e) => onClassChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Section <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder="Enter Section (e.g. A)"
        value={studentSection}
        onChange={(e) => onSectionChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  </div>
));
StudentFields.displayName = 'StudentFields';

interface FileUploadInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUploadInput = React.memo(({ onChange, disabled }: FileUploadInputProps) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Choose File (Excel/PDF) <span className="text-red-500">*</span>
    </label>
    <input
      type="file"
      accept=".pdf, .xls, .xlsx"
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    />
  </div>
));
FileUploadInput.displayName = 'FileUploadInput';

interface SelectedFileInfoProps {
  file: File;
  onRemove: () => void;
  isProcessing: boolean;
}

const SelectedFileInfo = React.memo(({ file, onRemove, isProcessing }: SelectedFileInfoProps) => (
  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
    <div className="flex items-center gap-3">
      <FileText className="w-5 h-5 text-green-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">File Ready</p>
        <p className="text-xs text-green-600">{file.name}</p>
      </div>
      {!isProcessing && (
        <button
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Remove
        </button>
      )}
    </div>
  </div>
));
SelectedFileInfo.displayName = 'SelectedFileInfo';

interface WorkflowProgressProps {
  workflowId: string;
  progress: number;
  currentStep: string;
}

const WorkflowProgress = React.memo(({ workflowId, progress, currentStep }: WorkflowProgressProps) => (
  <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
    <div className="flex items-center gap-3 mb-3">
      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900">Processing Workflow</p>
        <p className="text-xs text-blue-600 font-mono">ID: {workflowId}</p>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="mb-3">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
    </div>

    {/* Current Step */}
    {currentStep && (
      <div className="flex items-start gap-2 text-sm text-gray-700">
        <Clock className="w-4 h-4 mt-0.5 text-blue-500" />
        <span>{currentStep}</span>
      </div>
    )}
  </div>
));
WorkflowProgress.displayName = 'WorkflowProgress';

interface SuccessMessageProps {
  message: string;
  workflowStatus: WorkflowStatus | null;
  onReset: () => void;
}

const SuccessMessage = React.memo(({ message, workflowStatus, onReset }: SuccessMessageProps) => (
  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
    <div className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-900">Upload Successful!</p>
        <p className="text-sm text-green-700 mt-1">{message}</p>
      </div>
    </div>
    <button
      onClick={onReset}
      className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      Upload Another File
    </button>
  </div>
));
SuccessMessage.displayName = 'SuccessMessage';

interface ErrorMessageProps {
  message: string;
  onReset: () => void;
}

const ErrorMessage = React.memo(({ message, onReset }: ErrorMessageProps) => (
  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-900">Upload Failed</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
    </div>
    <button
      onClick={onReset}
      className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      Try Again
    </button>
  </div>
));
ErrorMessage.displayName = 'ErrorMessage';

const Instructions = React.memo(() => (
  <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
      <FileText className="w-4 h-4" />
      Upload Instructions:
    </h3>
    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
      {INSTRUCTIONS.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
    </ul>
  </div>
));
Instructions.displayName = 'Instructions';