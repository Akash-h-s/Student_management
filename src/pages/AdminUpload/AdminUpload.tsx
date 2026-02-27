
import { useAdminUpload } from './hooks/useAdminUpload';
import { Header } from './atoms/Header';
import { UploadTypeSelector } from './atoms/UploadTypeSelector';
import { StudentFields } from './atoms/StudentFields';
import { FileUploadInput } from './atoms/FileUploadInput';
import { SelectedFileInfo } from './atoms/SelectedFileInfo';
import { WorkflowProgress } from './atoms/WorkflowProgress';
import { SuccessMessage } from './atoms/SuccessMessage';
import { ErrorMessage } from './atoms/ErrorMessage';
import { Instructions } from './atoms/Instructions';

export default function AdminUpload() {
  const {
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
  } = useAdminUpload();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <Header />

          <UploadTypeSelector
            value={uploadType}
            onChange={setUploadType}
            disabled={isProcessing}
          />

          {showStudentFields && (
            <StudentFields
              studentClass={studentClass}
              studentSection={studentSection}
              onClassChange={setStudentClass}
              onSectionChange={setStudentSection}
              disabled={isProcessing}
            />
          )}

          <FileUploadInput
            onChange={handleFileChange}
            disabled={isProcessing}
          />

          {selectedFile && (
            <SelectedFileInfo
              file={selectedFile}
              onRemove={() => setSelectedFile(null)}
              isProcessing={isProcessing}
            />
          )}

          {isProcessing && workflowId && (
            <WorkflowProgress
              workflowId={workflowId}
              progress={progress}
              currentStep={currentStep}
            />
          )}

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

          <Instructions/>
        </div>
      </div>
    </div>
  );
}