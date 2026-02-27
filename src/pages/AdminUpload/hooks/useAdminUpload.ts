import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type{ UploadType, UploadStatus, WorkflowStatus } from '../types';
import { MESSAGES, API_BASE_URL, POLLING_INTERVAL_MS } from '../constants';
import { isValidFileType, getProgressFromStep, formatSuccessMessage } from '../utils';

export const useAdminUpload = () => {
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

    // Polling Logic
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const pollWorkflowStatus = useCallback(async (wfId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/workflow-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
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

    // Cleanup
    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    // Handlers
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

                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
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

    // Derived State
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

    return {
        uploadType, setUploadType,
        selectedFile, setSelectedFile,
        studentClass, setStudentClass,
        studentSection, setStudentSection,
        loading,
        uploadStatus,
        message,
        workflowId,
        workflowStatus,
        currentStep,
        progress,
        isProcessing,
        isUploadDisabled,
        showStudentFields,
        buttonClasses,
        handleFileChange,
        handleUpload,
        resetForm
    };
};
