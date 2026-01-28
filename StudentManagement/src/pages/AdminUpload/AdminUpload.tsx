// src/pages/AdminUpload.tsx
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

type UploadType = 'student' | 'teacher';

export default function AdminUpload() {
  const [uploadType, setUploadType] = useState<UploadType | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
      } else {
        alert('Please select a PDF or Excel file');
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) {
      return alert('Please select a file and upload type');
    }

    if (uploadType === 'student' && (!studentClass || !studentSection)) {
      return alert('Please provide Class and Section for student list');
    }

    setLoading(true);
    setUploadStatus('idle');
    
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];

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
          throw new Error(' uniquness voilation Server Error');
        }

        setMessage(`Upload Successful! ${uploadType} records processed.`);
        setUploadStatus('success');
        
        // Reset form
        setSelectedFile(null);
        setStudentClass('');
        setStudentSection('');
        setUploadType('');

      } catch (err: any) {
        setMessage('Upload failed: ' + err.message);
        setUploadStatus('error');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Upload Portal</h1>
              <p className="text-gray-600 text-sm">Upload student and teacher data</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
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
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !uploadType || !selectedFile}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : !uploadType || !selectedFile
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              'Start Upload'
            )}
          </button>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Upload Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Select upload type (Student or Teacher)</li>
              <li>For students, provide class and section information</li>
              <li>Choose Excel (.xlsx, .xls) or PDF file</li>
              <li>Click "Start Upload" to process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}