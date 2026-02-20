import React, { useState, useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAppSelector } from '../../store/hooks';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  GET_CLASS_MARKS_BY_EXAM,
  INSERT_MARKS,
} from '../../graphql/marks';
import type { Student, Mark, ClassMarksData, FetchStudentsData } from './types';
import { calculateGrade } from './utils';
import { FilterPanel } from './atoms/FilterPanel';
import { StatsPanel } from './atoms/StatsPanel';
import { MarksTable } from './atoms/MarksTable';

const MarksReview: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
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

        <FilterPanel
          className={className}
          sectionName={sectionName}
          examName={examName}
          subjectName={subjectName}
          onChangeClass={setClassName}
          onChangeSection={setSectionName}
          onChangeExam={setExamName}
          onChangeSubject={setSubjectName}
          onLoadMarks={handleLoadMarks}
          loading={loadingStudents || loadingMarks}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        {students.length > 0 && (
          <>
            <StatsPanel stats={marksStats} />

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <MarksTable
              students={filteredStudents}
              marksMap={marksMap}
              editingCell={editingCell}
              saving={saving}
              marksStats={marksStats}
              onCellChange={handleCellChange}
              onCellFocus={(id) => setEditingCell(`${id}`)}
              onCellBlur={() => setEditingCell(null)}
              onBulkUpdate={handleBulkUpdate}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MarksReview;
