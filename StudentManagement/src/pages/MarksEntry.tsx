// src/pages/MarksEntry.tsx
import React, { useState } from 'react';
import { Save, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Types
interface Student {
  id: number;
  admission_no: string;
  name: string;
}

interface MarkEntry {
  student_id: number;
  marks_obtained: string;
  grade: string;
  remarks: string;
}

const MarksEntrySystem: React.FC = () => {
  const { teacherId, user } = useAuth();
  const maxMarks = 100;

  // Manual input fields
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examName, setExamName] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<number, MarkEntry>>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateGrade = (marks: number): string => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId: number, marks: string) => {
    const numMarks = parseFloat(marks);
    const grade = marks && !isNaN(numMarks) ? calculateGrade(numMarks) : '';
    
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        marks_obtained: marks,
        grade: grade,
        remarks: prev[studentId]?.remarks || ''
      }
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        marks_obtained: prev[studentId]?.marks_obtained || '',
        grade: prev[studentId]?.grade || '',
        remarks: remarks
      }
    }));
  };

  const handleFetchStudents = async () => {
    if (!className.trim() || !sectionName.trim()) {
      setErrorMessage('Please enter both class and section');
      return;
    }

    setSearching(true);
    setErrorMessage('');
    setStudents([]);
    setMarksData({});

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch("http://localhost:3000/hasura/fetch-students", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          class_name: className.trim(),
          section_name: sectionName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to fetch students");
        setSearching(false);
        return;
      }

      if (!result.success) {
        setErrorMessage(result.message || "Failed to fetch students");
        setSearching(false);
        return;
      }

      if (result.students.length === 0) {
        setErrorMessage(`No students found for Class ${className}-${sectionName}`);
        setSearching(false);
        return;
      }

      setStudents(result.students);
      
      // Initialize marks data
      const initialMarks: Record<number, MarkEntry> = {};
      result.students.forEach((student: Student) => {
        initialMarks[student.id] = {
          student_id: student.id,
          marks_obtained: '',
          grade: '',
          remarks: ''
        };
      });
      setMarksData(initialMarks);
      setSearching(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setErrorMessage('Database connection error. Is the server running?');
      setSearching(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!teacherId) {
      setErrorMessage('Teacher ID not found. Please login again.');
      return;
    }

    if (!className.trim() || !sectionName.trim() || !subjectName.trim() || !examName.trim()) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    const marksToSave = Object.values(marksData).filter(mark => mark.marks_obtained !== '');
    
    if (marksToSave.length === 0) {
      setErrorMessage('Please enter marks for at least one student');
      return;
    }

    setLoading(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare data - NO teacher_id in payload (backend will extract from token)
      const marksEntries = marksToSave.map(mark => ({
        student_id: mark.student_id,
        subject_name: subjectName.trim(),
        exam_name: examName.trim(),
        class_name: className.trim(),
        section_name: sectionName.trim(),
        academic_year: academicYear.trim(),
        marks_obtained: parseFloat(mark.marks_obtained),
        max_marks: maxMarks,
        grade: mark.grade,
        remarks: mark.remarks,
        is_finalized: false
      }));

      const response = await fetch("http://localhost:3000/hasura/marks-entry", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Backend extracts teacher_id from this
        },
        body: JSON.stringify({
          action: 'save',
          data: {
            marks: marksEntries
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to save marks");
        setSaveStatus('error');
        setLoading(false);
        return;
      }

      if (!result.success) {
        setErrorMessage(result.message || "Failed to save marks");
        setSaveStatus('error');
        setLoading(false);
        return;
      }

      setSaveStatus('success');
      setLoading(false);
      
      console.log('Marks saved successfully by teacher:', result.teacher_id);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving marks:', error);
      setErrorMessage('Database connection error. Is the server running?');
      setSaveStatus('error');
      setLoading(false);
    }
  };

  const canSearch = className.trim() !== '' && sectionName.trim() !== '';
  const canSave = students.length > 0 && 
    className.trim() !== '' && 
    sectionName.trim() !== '' && 
    subjectName.trim() !== '' && 
    examName.trim() !== '' &&
    Object.values(marksData).some(mark => mark.marks_obtained !== '');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Marks Entry System</h1>
          
          {/* Teacher Info */}
          {user && teacherId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Teacher:</span> {user.name} | 
                <span className="font-semibold"> Email:</span> {user.email} | 
                <span className="font-semibold"> ID:</span> {teacherId}
              </p>
            </div>
          )}
          
          {/* Manual Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g., Mathematics"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Mid Term Exam"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFetchStudents}
                disabled={!canSearch || searching}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  canSearch && !searching
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Search className="w-5 h-5" />
                {searching ? 'Fetching...' : 'Fetch Students'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>Marks saved successfully!</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>Error saving marks. Please try again.</span>
            </div>
          )}

          {/* Class Info Display */}
          {students.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Showing students for:</span> Class {className}-{sectionName} | 
                Subject: {subjectName || 'Not specified'} | 
                Exam: {examName || 'Not specified'} | 
                Students: {students.length}
              </p>
            </div>
          )}
        </div>

        {/* Students Marks Table */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admission No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks (/{maxMarks})</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.5"
                          value={marksData[student.id]?.marks_obtained || ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                          marksData[student.id]?.grade === 'A+' || marksData[student.id]?.grade === 'A' 
                            ? 'bg-green-100 text-green-800'
                            : marksData[student.id]?.grade === 'B+' || marksData[student.id]?.grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : marksData[student.id]?.grade === 'C'
                            ? 'bg-yellow-100 text-yellow-800'
                            : marksData[student.id]?.grade === 'F'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {marksData[student.id]?.grade || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={marksData[student.id]?.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button */}
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.values(marksData).filter(m => m.marks_obtained !== '').length} of {students.length} students have marks entered
              </div>
              <button
                onClick={handleSaveMarks}
                disabled={!canSave || loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  canSave && !loading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {students.length === 0 && !searching && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Loaded</h3>
            <p className="text-gray-500">Enter class and section details above and click "Fetch Students" to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksEntrySystem;