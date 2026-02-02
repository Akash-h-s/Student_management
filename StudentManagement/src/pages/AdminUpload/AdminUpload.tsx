// src/pages/AdminUpload.tsx
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Loader2, Mail, Database, FileCheck } from 'lucide-react';

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

export default function AdminUpload() {
  const [uploadType, setUploadType] = useState<UploadType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  
  // Temporal workflow tracking
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Progress tracking
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setUploadStatus('idle');
        setMessage('');
      } else {
        alert('Please select a PDF or Excel file');
        e.target.value = '';
      }
    }
  };

  // Poll workflow status
  const pollWorkflowStatus = async (wfId: string) => {
    try {
      const res = await fetch('http://localhost:3000/hasura/workflow-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: wfId }),
      });

      if (res.ok) {
        const status: WorkflowStatus = await res.json();
        setWorkflowStatus(status);
        
        // Update progress based on current step
        if (status.currentStep) {
          setCurrentStep(status.currentStep);
          updateProgress(status.currentStep);
        }

        // If workflow completed, stop polling
        if (status.status === 'completed') {
          setUploadStatus('success');
          setProgress(100);
          setCurrentStep('Upload completed successfully!');
          setMessage(
            `✅ Successfully processed ${status.recordsProcessed || 0} records. ` +
            `${status.emailsSent || 0} emails sent, ${status.emailsFailed || 0} failed.`
          );
          stopPolling();
        } else if (status.status === 'failed') {
          setUploadStatus('error');
          setMessage('❌ Workflow failed. Please try again.');
          stopPolling();
        }
      }
    } catch (err) {
      console.error('Error polling workflow status:', err);
    }
  };

  const updateProgress = (step: string) => {
    const stepProgress: { [key: string]: number } = {
      'Parsing Excel file': 20,
      'Validating data': 40,
      'Creating database records': 60,
      'Sending emails': 80,
      'Finalizing': 95,
    };
    setProgress(stepProgress[step] || 0);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) {
      return alert('Please select a file and upload type');
    }

    if (uploadType === 'student' && (!studentClass || !studentSection)) {
      return alert('Please provide Class and Section for student list');
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

        const res = await fetch('http://localhost:3000/hasura/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

        // Store workflow ID
        setWorkflowId(data.workflowId);
        setUploadStatus('processing');
        setCurrentStep('Workflow started - processing your data...');

        // Start polling for workflow status
        const interval = setInterval(() => {
          pollWorkflowStatus(data.workflowId);
        }, 2000); // Poll every 2 seconds

        setPollingInterval(interval);

      } catch (err: any) {
        setMessage('Upload failed: ' + err.message);
        setUploadStatus('error');
        setProgress(0);
        setCurrentStep('');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const resetForm = () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Upload Portal</h1>
              <p className="text-gray-600 text-sm">Upload student and teacher data with Temporal workflows</p>
            </div>
          </div>

          {/* Upload Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Upload Category <span className="text-red-500">*</span>
            </label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as UploadType)}
              disabled={uploadStatus === 'processing'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Choose Type --</option>
              <option value="student">Student List</option>
              <option value="teacher">Teacher List</option>
            </select>
          </div>

          {/* Student-specific fields */}
          {uploadType === 'student' && (
            <div className="mb-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Class (e.g. 10)"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  disabled={uploadStatus === 'processing'}
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
                  onChange={(e) => setStudentSection(e.target.value)}
                  disabled={uploadStatus === 'processing'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File (Excel/PDF) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf, .xls, .xlsx"
              onChange={handleFileChange}
              disabled={uploadStatus === 'processing'}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">File Ready</p>
                  <p className="text-xs text-green-600">{selectedFile.name}</p>
                </div>
                {uploadStatus !== 'processing' && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Workflow Progress */}
          {uploadStatus === 'processing' && workflowId && (
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
                  ></div>
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

              {/* Workflow Steps */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileCheck className={`w-4 h-4 ${progress >= 20 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={progress >= 20 ? 'text-green-700 font-medium' : ''}>Parse Excel File</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className={`w-4 h-4 ${progress >= 40 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={progress >= 40 ? 'text-green-700 font-medium' : ''}>Validate Data</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Database className={`w-4 h-4 ${progress >= 60 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={progress >= 60 ? 'text-green-700 font-medium' : ''}>Insert to Database</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className={`w-4 h-4 ${progress >= 80 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={progress >= 80 ? 'text-green-700 font-medium' : ''}>Send Emails</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Upload Successful!</p>
                  <p className="text-sm text-green-700 mt-1">{message}</p>
                  {workflowStatus && (
                    <div className="mt-2 text-xs text-green-600 space-y-1">
                      <p>📊 Records: {workflowStatus.recordsProcessed}</p>
                      <p>✉️ Emails Sent: {workflowStatus.emailsSent}</p>
                      {workflowStatus.emailsFailed! > 0 && (
                        <p className="text-orange-600">⚠️ Emails Failed: {workflowStatus.emailsFailed}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={resetForm}
                className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upload Another File
              </button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Upload Failed</p>
                  <p className="text-sm text-red-700 mt-1">{message}</p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Upload Button */}
          {uploadStatus !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={loading || !uploadType || !selectedFile || uploadStatus === 'processing'}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                loading || uploadStatus === 'processing'
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : !uploadType || !selectedFile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading || uploadStatus === 'processing' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Workflow...
                </span>
              ) : (
                'Start Upload'
              )}
            </button>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload Instructions:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Select upload type (Student or Teacher)</li>
              <li>For students, provide class and section information</li>
              <li>Choose Excel (.xlsx, .xls) or PDF file</li>
              <li>Click "Start Upload" to begin the Temporal workflow</li>
              <li>Track real-time progress as data is processed</li>
              <li>Emails will be sent automatically upon completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}