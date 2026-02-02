// src/components/MarksEntry/MarksEntrySystem.tsx
import React, { useState, useEffect } from 'react';
import { Save, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  INSERT_MARKS,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
} from '../../graphql/marks';

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
  // ✅ Get teacher ID from Auth Context
  const { user: currentUser } = useAuth();
  const teacherId = currentUser?.id ? parseInt(currentUser.id) : null;
  const teacherName = currentUser?.name;
  const maxMarks = 100;

  // Manual input fields
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examName, setExamName] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<number, MarkEntry>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Apollo Client Queries and Mutations
  const [fetchStudents, { loading: searching }] = useLazyQuery(
    GET_STUDENTS_BY_CLASS_SECTION,
    {
      onCompleted: (data) => {
        if (data?.class_sections && data.class_sections.length > 0) {
          const fetchedStudents = data.class_sections[0]?.students || [];
          
          if (fetchedStudents.length === 0) {
            setErrorMessage(`No students found for Class ${className}-${sectionName}`);
            setStudents([]);
            return;
          }

          setStudents(fetchedStudents);
          
          // Initialize marks data
          const initialMarks: Record<number, MarkEntry> = {};
          fetchedStudents.forEach((student: Student) => {
            initialMarks[student.id] = {
              student_id: student.id,
              marks_obtained: '',
              grade: '',
              remarks: ''
            };
          });
          setMarksData(initialMarks);
          setErrorMessage('');
        } else {
          setErrorMessage(`No class found: ${className}-${sectionName}`);
          setStudents([]);
        }
      },
      onError: (error) => {
        console.error('Error fetching students:', error);
        setErrorMessage('Failed to fetch students. Please check your connection.');
        setStudents([]);
      }
    }
  );

  const [createSubject] = useMutation(GET_OR_CREATE_SUBJECT);
  const [createExam] = useMutation(GET_OR_CREATE_EXAM);
  const [insertMarks, { loading: saving }] = useMutation(INSERT_MARKS, {
    onCompleted: (data) => {
      if (data?.insert_marks?.affected_rows > 0) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setErrorMessage('No marks were saved');
      }
    },
    onError: (error) => {
      console.error('Error saving marks:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save marks: ' + error.message);
    }
  });

  // Show error if teacher is not authenticated
  useEffect(() => {
    if (!teacherId) {
      setErrorMessage('Teacher not authenticated. Please log in.');
    } else {
      setErrorMessage('');
    }
  }, [teacherId]);

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
    if (!teacherId) {
      setErrorMessage('Teacher ID not found. Please log in again.');
      return;
    }

    if (!className.trim() || !sectionName.trim()) {
      setErrorMessage('Please enter both class and section');
      return;
    }

    setErrorMessage('');
    setStudents([]);
    setMarksData({});

    // Execute the query
    fetchStudents({
      variables: {
        className: className.trim(),
        sectionName: sectionName.trim(),
      }
    });
  };

  const handleSaveMarks = async () => {
    if (!teacherId) {
      setErrorMessage('Teacher ID not found. Please log in again.');
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

    setSaveStatus('idle');
    setErrorMessage('');

    try {
      // Step 1: Create or get subject
      const subjectResult = await createSubject({
        variables: {
          name: subjectName.trim(),
          className: className.trim(),
          teacherId: teacherId,
        }
      });

      const subjectId = subjectResult.data?.insert_subjects_one?.id;

      if (!subjectId) {
        setErrorMessage('Failed to create/fetch subject');
        setSaveStatus('error');
        return;
      }

      // Step 2: Create or get exam
      const examResult = await createExam({
        variables: {
          name: examName.trim(),
          academicYear: academicYear.trim() || new Date().getFullYear().toString(),
        }
      });

      const examId = examResult.data?.insert_exams_one?.id;

      if (!examId) {
        setErrorMessage('Failed to create/fetch exam');
        setSaveStatus('error');
        return;
      }

      // Step 3: Prepare marks data
      const marksEntries = marksToSave.map(mark => ({
        student_id: mark.student_id,
        subject_id: subjectId,
        exam_id: examId,
        teacher_id: teacherId,
        marks_obtained: parseFloat(mark.marks_obtained),
        max_marks: maxMarks,
        grade: mark.grade,
        remarks: mark.remarks || null,
        is_finalized: false,
        entered_at: new Date().toISOString(),
      }));

      console.log('Saving marks:', marksEntries);

      // Step 4: Insert marks
      await insertMarks({
        variables: {
          marks: marksEntries
        }
      });

    } catch (error: any) {
      console.error('Error in save process:', error);
      setErrorMessage('Failed to save marks: ' + error.message);
      setSaveStatus('error');
    }
  };

  const canSearch = className.trim() !== '' && sectionName.trim() !== '' && !!teacherId;
  const canSave = students.length > 0 && 
    className.trim() !== '' && 
    sectionName.trim() !== '' && 
    subjectName.trim() !== '' && 
    examName.trim() !== '' &&
    !!teacherId &&
    Object.values(marksData).some(mark => mark.marks_obtained !== '');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Marks Entry System</h1>
          
          {/* Teacher Info */}
          {teacherId ? (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Logged in as:</span> {teacherName} (Teacher ID: {teacherId})
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">
                <span className="font-semibold">Not authenticated.</span> Please log in to continue.
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
                disabled={!teacherId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!teacherId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!teacherId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!teacherId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!teacherId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!canSave || saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  canSave && !saving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Marks'}
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
            <p className="text-gray-500">
              {teacherId 
                ? 'Enter class and section details above and click "Fetch Students" to begin'
                : 'Please log in to load students'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksEntrySystem;