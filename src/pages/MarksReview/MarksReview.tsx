import React, { useState, useCallback, useMemo } from 'react';
import { Search, Download, Edit2, Check, AlertCircle } from 'lucide-react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  GET_CLASS_MARKS_BY_EXAM,
  INSERT_MARKS,
} from '../../graphql/marks';

interface Student {
  id: number;
  admission_no: string;
  name: string;
}

interface Mark {
  id: number;
  student_id: number;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  remarks: string | null;
}

interface ClassMarksData {
  marks: Mark[];
}

interface FetchStudentsData {
  class_sections: {
    students: Student[];
  }[];
}

const GRADE_THRESHOLDS = [
  { threshold: 90, grade: 'A+', colorClass: 'bg-green-100 text-green-800' },
  { threshold: 80, grade: 'A', colorClass: 'bg-green-100 text-green-800' },
  { threshold: 70, grade: 'B+', colorClass: 'bg-blue-100 text-blue-800' },
  { threshold: 60, grade: 'B', colorClass: 'bg-blue-100 text-blue-800' },
  { threshold: 50, grade: 'C', colorClass: 'bg-yellow-100 text-yellow-800' },
  { threshold: 40, grade: 'D', colorClass: 'bg-orange-100 text-orange-800' },
  { threshold: 0, grade: 'F', colorClass: 'bg-red-100 text-red-800' },
] as const;

const calculateGrade = (marks: number): string =>
  GRADE_THRESHOLDS.find(({ threshold }) => marks >= threshold)?.grade || 'F';

const getGradeColorClass = (grade: string): string =>
  GRADE_THRESHOLDS.find((g) => g.grade === grade)?.colorClass || 'bg-gray-100 text-gray-800';

const MarksReview: React.FC = () => {
  const { user: currentUser } = useAuth();
  const teacherId = currentUser?.id ? parseInt(currentUser.id.toString()) : null;

  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<Record<number, Partial<Mark>>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [fetchStudents, { loading: loadingStudents }] = useLazyQuery<FetchStudentsData>(GET_STUDENTS_BY_CLASS_SECTION, {
    onCompleted: (data) => {
      if (data?.class_sections?.length > 0) {
        const fetchedStudents = data.class_sections[0]?.students || [];
        setStudents(fetchedStudents);
        setErrorMessage('');
      } else {
        setErrorMessage(`No students found for Class ${className}-${sectionName}`);
      }
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to fetch students');
      console.error(error);
    },
  });

  const [getClassMarks, { loading: loadingMarks }] = useLazyQuery<ClassMarksData>(GET_CLASS_MARKS_BY_EXAM, {
    onCompleted: (data) => {
      if (data?.marks) {
        const marks: Record<number, Partial<Mark>> = {};
        data.marks.forEach((mark: Mark) => {
          marks[mark.student_id] = mark;
        });
        setMarksMap(marks);
        setSuccessMessage(`Loaded ${data.marks.length} marks`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to fetch marks');
      console.error(error);
    },
  });

  const [updateMarks, { loading: saving }] = useMutation(INSERT_MARKS, {
    onCompleted: () => {
      setSuccessMessage('✅ Marks updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to update marks: ' + error.message);
    },
  });

  const handleLoadMarks = () => {
    if (!className || !sectionName || !examName || !subjectName) {
      setErrorMessage('Please fill all fields');
      return;
    }
    fetchStudents({ variables: { className: className.trim(), sectionName: sectionName.trim() } });
    getClassMarks({ variables: { examName: examName.trim(), subjectName: subjectName.trim() } });
  };

  const handleCellChange = useCallback((studentId: number, value: string) => {
    const marks = parseFloat(value);
    const grade = !isNaN(marks) ? calculateGrade(marks) : '';
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: marks,
        grade,
      },
    }));
  }, []);

  const handleBulkUpdate = async () => {
    if (!teacherId) return;

    const changedMarks = Object.entries(marksMap)
      .filter(([_, mark]) => mark.marks_obtained !== undefined)
      .map(([studentId, mark]) => ({
        student_id: parseInt(studentId),
        marks_obtained: mark.marks_obtained,
        max_marks: mark.max_marks || 100,
        grade: mark.grade || '',
        remarks: mark.remarks || null,
        teacher_id: teacherId,
        entered_at: new Date().toISOString(),
      }));

    if (changedMarks.length === 0) {
      setErrorMessage('No marks to update');
      return;
    }

    try {
      await updateMarks({ variables: { marks: changedMarks } });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.admission_no.includes(searchTerm)),
    [students, searchTerm]
  );

  const marksStats = useMemo(() => {
    const filled = Object.values(marksMap).filter((m) => m.marks_obtained !== undefined).length;
    const pending = students.length - filled;
    return { filled, pending, total: students.length };
  }, [marksMap, students]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">📊 Class Marks Review</h1>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Class (e.g., 10)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Section (e.g., A)"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Exam (e.g., FA1)"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLoadMarks}
            disabled={loadingStudents || loadingMarks}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> {loadingStudents || loadingMarks ? 'Loading...' : 'Load Class Marks'}
          </button>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {successMessage}
            </div>
          )}
        </div>

        {students.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{marksStats.filled}</div>
                <div className="text-sm text-gray-600">Marks Filled</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">{marksStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-600">{marksStats.total}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Marks Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admission No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((student, idx) => {
                      const mark = marksMap[student.id];
                      const hasMarks = mark?.marks_obtained !== undefined;
                      return (
                        <tr key={student.id} className={hasMarks ? 'bg-green-50' : 'bg-red-50'}>
                          <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={mark?.marks_obtained ?? ''}
                              onChange={(e) => handleCellChange(student.id, e.target.value)}
                              onFocus={() => setEditingCell(`${student.id}`)}
                              onBlur={() => setEditingCell(null)}
                              className={`w-20 px-2 py-1 border rounded ${
                                editingCell === `${student.id}` ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                              } focus:outline-none`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColorClass(mark?.grade || 'F')}`}>
                              {mark?.grade || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {hasMarks ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                <Check className="w-4 h-4" /> Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                                <AlertCircle className="w-4 h-4" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 border-t flex gap-2 justify-end">
                <button
                  onClick={handleBulkUpdate}
                  disabled={saving || marksStats.pending === marksStats.total}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> {saving ? 'Saving...' : 'Update All Marks'}
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export Excel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarksReview;
