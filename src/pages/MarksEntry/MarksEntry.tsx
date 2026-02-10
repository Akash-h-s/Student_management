import React, { useState, useCallback, useEffect } from 'react';
import { Save, Search, AlertCircle, Edit2, Plus, X } from 'lucide-react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  INSERT_MARKS,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
  CHECK_EXAM_EXISTS,
  CHECK_EXISTING_MARKS,
  GET_ALL_SUBJECTS,
} from '../../graphql/marks';


type SaveStatus = 'idle' | 'success' | 'error';

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

interface GradeConfig {
  threshold: number;
  grade: string;
  colorClass: string;
}

interface Subject {
  id: number;
  name: string;
}

interface FetchStudentsData {
  class_sections: {
    students: Student[];
  }[];
}

interface InsertMarksData {
  insert_marks: {
    affected_rows: number;
  };
}

interface SubjectMutationData {
  insert_subjects_one: { id: number };
}

interface ExamMutationData {
  insert_exams_one: { id: number };
}

interface FetchSubjectsData {
  subjects: Subject[];
}


const MAX_MARKS = 100;
const TEST_TYPES = ['FA1', 'FA2', 'FA3', 'FA4', 'Mid-term Exam', 'Final Exam'] as const;
const GRADE_THRESHOLDS: GradeConfig[] = [
  { threshold: 90, grade: 'A+', colorClass: 'bg-green-100 text-green-800' },
  { threshold: 80, grade: 'A', colorClass: 'bg-green-100 text-green-800' },
  { threshold: 70, grade: 'B+', colorClass: 'bg-blue-100 text-blue-800' },
  { threshold: 60, grade: 'B', colorClass: 'bg-blue-100 text-blue-800' },
  { threshold: 50, grade: 'C', colorClass: 'bg-yellow-100 text-yellow-800' },
  { threshold: 40, grade: 'D', colorClass: 'bg-orange-100 text-orange-800' },
  { threshold: 0, grade: 'F', colorClass: 'bg-red-100 text-red-800' },
] as const;

const ERROR_MESSAGES = {
  NOT_AUTHENTICATED: 'Teacher not authenticated. Please log in.',
  LOGIN_REQUIRED: 'Teacher ID not found. Please log in again.',
  CLASS_SECTION_REQUIRED: 'Please enter both class and section',
  ALL_FIELDS_REQUIRED: 'Please fill all required fields',
  NO_MARKS_ENTERED: 'Please enter marks for at least one student',
  SUBJECT_FAILED: 'Failed to create/fetch subject',
  EXAM_FAILED: 'Failed to create/fetch exam',
  SAVE_FAILED: 'Failed to save marks: ',
  FETCH_FAILED: 'Failed to fetch students. Please check your connection.',
} as const;

const PLACEHOLDERS = {
  CLASS: 'e.g., 10',
  SECTION: 'e.g., A',
  SUBJECT: 'Select or create subject',
  EXAM: 'e.g., Mid Term Exam',
  ACADEMIC_YEAR: 'e.g., 2024-25',
  MARKS: '0',
  REMARKS: 'Optional',
} as const;

const TABLE_HEADERS = ['S.No', 'Admission No', 'Student Name', `Marks (/${MAX_MARKS})`, 'Grade', 'Remarks'] as const;
const BUTTON_STYLES = { primary: 'bg-blue-600 text-white hover:bg-blue-700', disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed' } as const;


const parseTeacherId = (id: string | undefined): number | null => (id ? parseInt(id, 10) : null);
const getCurrentYear = (): string => new Date().getFullYear().toString();
const calculateGrade = (marks: number): string => GRADE_THRESHOLDS.find(({ threshold }) => marks >= threshold)?.grade || 'F';
const getGradeColorClass = (grade: string): string => GRADE_THRESHOLDS.find((g) => g.grade === grade)?.colorClass || 'bg-gray-100 text-gray-800';

// Normalize subject name (case-insensitive matching)
const normalizeSubjectName = (name: string): string => name.toLowerCase().trim();
const findSimilarSubject = (inputName: string, subjects: Subject[]): Subject | undefined => {
  const normalized = normalizeSubjectName(inputName);
  return subjects.find(s => normalizeSubjectName(s.name) === normalized);
};

const initializeMarksData = (students: Student[]): Record<number, MarkEntry> => {
  const initialMarks: Record<number, MarkEntry> = {};
  students.forEach((student) => {
    initialMarks[student.id] = { student_id: student.id, marks_obtained: '', grade: '', remarks: '' };
  });
  return initialMarks;
};


const AlertBox = React.memo(({ type, icon, children }: { type: 'info' | 'success' | 'error' | 'warning', icon?: React.ReactNode, children: React.ReactNode }) => {
  const colors = { info: 'bg-blue-50 border-blue-200 text-blue-800', success: 'bg-green-50 border-green-200 text-green-800', error: 'bg-red-50 border-red-200 text-red-800', warning: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
  return <div className={`mb-4 p-3 border rounded-md flex items-center gap-2 ${colors[type]}`}>{icon} <span className="text-sm">{children}</span></div>;
});

const FormInput = React.memo(({ label, value, onChange, placeholder, disabled, required }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, disabled?: boolean, required?: boolean }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
  </div>
));

const FormSelect = React.memo(({ label, value, onChange, options, disabled, required }: { label: string, value: string, onChange: (v: string) => void, options: readonly string[], disabled?: boolean, required?: boolean }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
    >
      <option value="">Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
));

// Subject dropdown with "Add New" functionality
const SubjectSelectWithNew = React.memo(({
  label,
  value,
  onChange,
  subjects,
  disabled,
  required,
  onAddNew
}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  subjects: Subject[],
  disabled?: boolean,
  required?: boolean,
  onAddNew: (name: string) => void
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [similarSuggestion, setSimilarSuggestion] = useState<Subject | undefined>();

  const handleAddNew = () => {
    if (newSubjectName.trim()) {
      // Check for similar subjects
      const similar = findSimilarSubject(newSubjectName, subjects);
      if (similar) {
        setSimilarSuggestion(similar);
        return;
      }
      onAddNew(newSubjectName.trim());
      setNewSubjectName('');
      setShowAddNew(false);
      setSimilarSuggestion(undefined);
    }
  };

  const handleUseSimilar = (subject: Subject) => {
    onChange(subject.name);
    setShowAddNew(false);
    setNewSubjectName('');
    setSimilarSuggestion(undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {!showAddNew ? (
        <div className="flex gap-2">
          <select
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSimilarSuggestion(undefined);
            }}
            disabled={disabled}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddNew(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
            title="Add New Subject"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
          {similarSuggestion ? (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="text-yellow-800 font-medium">Similar subject found:</p>
              <p className="text-yellow-700 mt-1">Did you mean "<strong>{similarSuggestion.name}</strong>"?</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleUseSimilar(similarSuggestion)}
                  className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Yes, Use It
                </button>
                <button
                  type="button"
                  onClick={() => setSimilarSuggestion(undefined)}
                  className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                >
                  No, Add New
                </button>
              </div>
            </div>
          ) : null}
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Enter new subject name (e.g., Mathematics)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddNew();
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddNew}
              className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              Create Subject
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddNew(false);
                setNewSubjectName('');
                setSimilarSuggestion(undefined);
              }}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

SubjectSelectWithNew.displayName = 'SubjectSelectWithNew';

const StudentRow = React.memo(({ student, index, markData, maxMarks, onMarksChange, onRemarksChange, isEditing }: { student: Student, index: number, markData: MarkEntry, maxMarks: number, onMarksChange: (id: number, m: string) => void, onRemarksChange: (id: number, r: string) => void, isEditing?: boolean }) => (
  <tr className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
    <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
      {student.name}
      {isEditing && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded"><Edit2 className="w-3 h-3" /> Edit</span>}
    </td>
    <td className="px-4 py-3">
      <input type="number" min="0" max={maxMarks} step="0.5" value={markData.marks_obtained} onChange={(e) => onMarksChange(student.id, e.target.value)} className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </td>
    <td className="px-4 py-3"><span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${getGradeColorClass(markData.grade)}`}>{markData.grade || '-'}</span></td>
    <td className="px-4 py-3"><input type="text" value={markData.remarks} onChange={(e) => onRemarksChange(student.id, e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" /></td>
  </tr>
));


const MarksEntrySystem: React.FC = () => {
  const { user: currentUser } = useAuth();

  const teacherId = parseTeacherId(currentUser?.id?.toString());
  const teacherName = currentUser?.name;

  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [testType, setTestType] = useState('');
  const [examName, setExamName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<number, MarkEntry>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateTestWarning, setDuplicateTestWarning] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingMarksMap, setExistingMarksMap] = useState<Record<number, any>>({});
  const [savedStudentIds, setSavedStudentIds] = useState<Set<number>>(new Set());
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [currentExamId, setCurrentExamId] = useState<number | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  const [createSubject] = useMutation<SubjectMutationData>(GET_OR_CREATE_SUBJECT);
  const [createExam] = useMutation<ExamMutationData>(GET_OR_CREATE_EXAM);

  const [getSubjects] = useLazyQuery<FetchSubjectsData>(GET_ALL_SUBJECTS, {
    onCompleted: useCallback((data: FetchSubjectsData) => {
      setAvailableSubjects(data?.subjects || []);
    }, []),
    onError: useCallback(() => {
      setAvailableSubjects([]);
    }, []),
  });

  const [checkExam] = useLazyQuery(CHECK_EXAM_EXISTS, {
    onCompleted: useCallback((data: any) => {
      if (data?.exams?.length > 0) {
        setDuplicateTestWarning(`⚠️ "${testType}" already exists for ${academicYear || getCurrentYear()}. Update marks for existing test or select a different test type.`);
      } else {
        setDuplicateTestWarning('');
      }
    }, [testType, academicYear]),
    onError: useCallback(() => {
      setDuplicateTestWarning('');
    }, []),
  });

  const [checkExistingMarks] = useLazyQuery(CHECK_EXISTING_MARKS, {
    onCompleted: useCallback((data: any) => {
      if (data?.marks?.length > 0) {
        const existingMap: Record<number, any> = {};
        const updatedMarksData: Record<number, MarkEntry> = { ...marksData };

        data.marks.forEach((mark: any) => {
          existingMap[mark.student_id] = mark;
          updatedMarksData[mark.student_id] = {
            student_id: mark.student_id,
            marks_obtained: mark.marks_obtained.toString(),
            grade: mark.grade,
            remarks: mark.remarks || '',
          };
        });

        setExistingMarksMap(existingMap);
        setMarksData(updatedMarksData);
        setIsEditMode(true);
        setErrorMessage(`✏️ Found existing marks for ${data.marks.length} student(s). You can now update them.`);
      } else {
        setIsEditMode(false);
        setExistingMarksMap({});
      }
    }, [marksData]),
    onError: useCallback(() => {
      setIsEditMode(false);
      setExistingMarksMap({});
    }, []),
  });

  const [fetchStudents, { loading: searching }] = useLazyQuery<FetchStudentsData>(GET_STUDENTS_BY_CLASS_SECTION, {
    onCompleted: useCallback((data: FetchStudentsData) => {
      if (data?.class_sections?.length > 0) {
        const fetchedStudents = data.class_sections[0]?.students || [];
        if (fetchedStudents.length === 0) {
          setErrorMessage(`No students found for Class ${className}-${sectionName}`);
          setStudents([]);
          return;
        }
        setStudents(fetchedStudents);
        setMarksData(initializeMarksData(fetchedStudents));
        setErrorMessage('');
      } else {
        setErrorMessage(`No class found: ${className}-${sectionName}`);
        setStudents([]);
      }
    }, [className, sectionName]),
    onError: useCallback((error: ApolloError) => {
      setErrorMessage(ERROR_MESSAGES.FETCH_FAILED);
      console.error(error);
    }, []),
  });

  const [insertMarks, { loading: saving }] = useMutation<InsertMarksData>(INSERT_MARKS, {
    onCompleted: useCallback((data: InsertMarksData) => {
      if (data?.insert_marks?.affected_rows > 0) {
        setSaveStatus('success');
        const message = isEditMode
          ? `✅ ${data.insert_marks.affected_rows} mark(s) updated successfully!`
          : `✅ Marks saved successfully!`;
        setErrorMessage(message);

        const newSavedIds = new Set(savedStudentIds);
        Object.keys(marksData).forEach(key => {
          const studentId = parseInt(key);
          if (marksData[studentId]?.marks_obtained) {
            newSavedIds.add(studentId);
          }
        });
        setSavedStudentIds(newSavedIds);

        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, [isEditMode, marksData, savedStudentIds]),
    onError: useCallback((error: ApolloError) => {
      setSaveStatus('error');
      setErrorMessage(ERROR_MESSAGES.SAVE_FAILED + error.message);
    }, []),
  });

  // Fetch subjects when class changes
  useEffect(() => {
    if (className) {
      getSubjects({ variables: { className: className.trim() } });
    } else {
      setAvailableSubjects([]);
    }
  }, [className]);

  // Update exam name when test type changes
  useEffect(() => {
    if (testType) {
      setExamName(testType);
      checkExam({ variables: { name: testType, academicYear: academicYear || getCurrentYear() } });
    } else {
      setDuplicateTestWarning('');
    }
  }, [testType, academicYear]);

  // When students are loaded + we have subject/exam IDs, check for existing marks
  useEffect(() => {
    if (students.length > 0 && currentSubjectId && currentExamId) {
      checkExistingMarks({
        variables: {
          subjectId: currentSubjectId,
          examId: currentExamId,
          studentIds: students.map(s => s.id)
        }
      });
    }
  }, [students, currentSubjectId, currentExamId]);

  const handleMarksChange = useCallback((studentId: number, marks: string) => {
    const numMarks = parseFloat(marks);
    const grade = marks && !isNaN(numMarks) ? calculateGrade(numMarks) : '';
    setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], marks_obtained: marks, grade } }));
  }, []);

  const handleRemarksChange = useCallback((studentId: number, remarks: string) => {
    setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  }, []);

  const handleAddNewSubject = async (newSubjectName: string) => {
    if (!teacherId || !className) return;
    try {
      const result = await createSubject({
        variables: {
          name: newSubjectName.trim().toLowerCase(),
          className: className.trim(),
          teacherId
        }
      });
      if (result.data?.insert_subjects_one?.id) {
        setSubjectName(newSubjectName.trim().toLowerCase());
        // Refresh subjects list
        getSubjects({ variables: { className: className.trim() } });
        setErrorMessage(`✅ Subject "${newSubjectName}" created successfully!`);
      }
    } catch (err) {
      const error = err as Error;
      setErrorMessage('Failed to create subject: ' + error.message);
    }
  };

  const handleFetchStudents = async () => {
    if (!teacherId || !className || !sectionName) return setErrorMessage(ERROR_MESSAGES.CLASS_SECTION_REQUIRED);
    if (!subjectName || !examName) return setErrorMessage(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);

    try {
      const subRes = await createSubject({ variables: { name: subjectName.trim().toLowerCase(), className: className.trim(), teacherId } });
      const exRes = await createExam({ variables: { name: examName.trim(), academicYear: academicYear.trim() || getCurrentYear() } });

      const subjectId = subRes.data?.insert_subjects_one.id;
      const examId = exRes.data?.insert_exams_one.id;

      if (subjectId && examId) {
        setCurrentSubjectId(subjectId);
        setCurrentExamId(examId);
      }

      fetchStudents({ variables: { className: className.trim(), sectionName: sectionName.trim() } });
    } catch (err) {
      const error = err as Error;
      setErrorMessage('Error loading subject/exam: ' + error.message);
    }
  };

  const handleSaveMarks = async () => {
    if (!teacherId || !className || !sectionName || !subjectName || !examName) return setErrorMessage(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
    const marksToSave = Object.values(marksData).filter((m) => m.marks_obtained !== '');
    if (marksToSave.length === 0) return setErrorMessage(ERROR_MESSAGES.NO_MARKS_ENTERED);

    try {
      const subRes = await createSubject({ variables: { name: subjectName.trim().toLowerCase(), className: className.trim(), teacherId } });
      const exRes = await createExam({ variables: { name: examName.trim(), academicYear: academicYear.trim() || getCurrentYear() } });

      const subjectId = subRes.data?.insert_subjects_one.id;
      const examId = exRes.data?.insert_exams_one.id;

      if (subjectId && examId) {
        const entries = marksToSave.map((m) => ({
          student_id: m.student_id,
          subject_id: subjectId,
          exam_id: examId,
          teacher_id: teacherId,
          marks_obtained: parseFloat(m.marks_obtained),
          max_marks: MAX_MARKS,
          grade: m.grade,
          remarks: m.remarks || null,
          entered_at: new Date().toISOString(),
        }));
        await insertMarks({ variables: { marks: entries } });
      }
    } catch (err) {
      const error = err as Error;
      setErrorMessage(ERROR_MESSAGES.SAVE_FAILED + error.message);
      setSaveStatus('error');
    }
  };

  const canSave = students.length > 0 && !!teacherId && Object.values(marksData).some(m => m.marks_obtained !== '');
  const pendingStudents = students.filter(s => !marksData[s.id]?.marks_obtained);
  const pendingCount = pendingStudents.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Marks Entry System</h1>
          {teacherId ? (
            <AlertBox type="info"><span className="font-semibold">Logged in:</span> {teacherName}</AlertBox>
          ) : (
            <AlertBox type="error" icon={<AlertCircle className="w-5 h-5" />}>{ERROR_MESSAGES.NOT_AUTHENTICATED}</AlertBox>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FormInput label="Class" value={className} onChange={setClassName} placeholder={PLACEHOLDERS.CLASS} required />
            <FormInput label="Section" value={sectionName} onChange={setSectionName} placeholder={PLACEHOLDERS.SECTION} required />
            <SubjectSelectWithNew
              label="Subject"
              value={subjectName}
              onChange={setSubjectName}
              subjects={availableSubjects}
              onAddNew={handleAddNewSubject}
              required
            />
            <FormSelect label="Test Type" value={testType} onChange={setTestType} options={TEST_TYPES} required />
            <FormInput label="Academic Year" value={academicYear} onChange={setAcademicYear} placeholder={PLACEHOLDERS.ACADEMIC_YEAR} />
            <div className="flex items-end">
              <button onClick={handleFetchStudents} disabled={searching} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${searching ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary}`}>
                <Search className="w-5 h-5" /> {searching ? 'Fetching...' : 'Fetch Students'}
              </button>
            </div>
          </div>
          {duplicateTestWarning && <AlertBox type="warning">{duplicateTestWarning}</AlertBox>}
          {saveStatus === 'success' && errorMessage ? (
            <AlertBox type="success">{errorMessage}</AlertBox>
          ) : saveStatus === 'error' && errorMessage ? (
            <AlertBox type="error">{errorMessage}</AlertBox>
          ) : errorMessage && saveStatus === 'idle' ? (
            <AlertBox type={errorMessage.includes('✏️') || errorMessage.includes('✅') ? 'info' : 'error'}>{errorMessage}</AlertBox>
          ) : null}
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {isEditMode && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">Edit Mode - Updating existing marks</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-yellow-700">⚠️ {pendingCount} student(s) with pending marks</span>
                <span className="text-xs text-yellow-600">Click on Pending rows to enter marks</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full table-auto">
                <thead className="bg-gray-100 border-b">
                  <tr>{TABLE_HEADERS.map(h => <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((s, i) => <StudentRow key={s.id} student={s} index={i} markData={marksData[s.id]} maxMarks={MAX_MARKS} onMarksChange={handleMarksChange} onRemarksChange={handleRemarksChange} isEditing={!!existingMarksMap[s.id]} isPending={!marksData[s.id]?.marks_obtained} />)}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={handleSaveMarks} disabled={!canSave || saving} className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium ${canSave && !saving ? BUTTON_STYLES.primary : BUTTON_STYLES.disabled}`}>
                <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarksEntrySystem;
