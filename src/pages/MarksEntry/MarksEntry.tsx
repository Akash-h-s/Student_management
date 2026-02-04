import React, { useState,useCallback} from 'react';
import { Save, Search, AlertCircle} from 'lucide-react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  INSERT_MARKS,
  GET_OR_CREATE_SUBJECT,
  GET_OR_CREATE_EXAM,
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


const MAX_MARKS = 100;
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

const SUCCESS_MESSAGES = { MARKS_SAVED: 'Marks saved successfully!' } as const;
const PLACEHOLDERS = {
  CLASS: 'e.g., 10',
  SECTION: 'e.g., A',
  SUBJECT: 'e.g., Mathematics',
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

const StudentRow = React.memo(({ student, index, markData, maxMarks, onMarksChange, onRemarksChange }: { student: Student, index: number, markData: MarkEntry, maxMarks: number, onMarksChange: (id: number, m: string) => void, onRemarksChange: (id: number, r: string) => void }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{student.admission_no}</td>
    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
    <td className="px-4 py-3">
      <input type="number" min="0" max={maxMarks} step="0.5" value={markData.marks_obtained} onChange={(e) => onMarksChange(student.id, e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
  const [examName, setExamName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<Record<number, MarkEntry>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

 
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

  const [createSubject] = useMutation<SubjectMutationData>(GET_OR_CREATE_SUBJECT);
  const [createExam] = useMutation<ExamMutationData>(GET_OR_CREATE_EXAM);
  const [insertMarks, { loading: saving }] = useMutation<InsertMarksData>(INSERT_MARKS, {
    onCompleted: useCallback((data: InsertMarksData) => {
      if (data?.insert_marks?.affected_rows > 0) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, []),
    onError: useCallback((error: ApolloError) => {
      setSaveStatus('error');
      setErrorMessage(ERROR_MESSAGES.SAVE_FAILED + error.message);
    }, []),
  });

  const handleMarksChange = useCallback((studentId: number, marks: string) => {
    const numMarks = parseFloat(marks);
    const grade = marks && !isNaN(numMarks) ? calculateGrade(numMarks) : '';
    setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], marks_obtained: marks, grade } }));
  }, []);

  const handleRemarksChange = useCallback((studentId: number, remarks: string) => {
    setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  }, []);

  const handleFetchStudents = () => {
    if (!teacherId || !className || !sectionName) return setErrorMessage(ERROR_MESSAGES.CLASS_SECTION_REQUIRED);
    fetchStudents({ variables: { className: className.trim(), sectionName: sectionName.trim() } });
  };

  const handleSaveMarks = async () => {
    if (!teacherId || !className || !sectionName || !subjectName || !examName) return setErrorMessage(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
    const marksToSave = Object.values(marksData).filter((m) => m.marks_obtained !== '');
    if (marksToSave.length === 0) return setErrorMessage(ERROR_MESSAGES.NO_MARKS_ENTERED);

    try {
      const subRes = await createSubject({ variables: { name: subjectName.trim(), className: className.trim(), teacherId } });
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
            <FormInput label="Subject" value={subjectName} onChange={setSubjectName} placeholder={PLACEHOLDERS.SUBJECT} required />
            <FormInput label="Exam Name" value={examName} onChange={setExamName} placeholder={PLACEHOLDERS.EXAM} required />
            <FormInput label="Academic Year" value={academicYear} onChange={setAcademicYear} placeholder={PLACEHOLDERS.ACADEMIC_YEAR} />
            <div className="flex items-end">
              <button onClick={handleFetchStudents} disabled={searching} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${searching ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary}`}>
                <Search className="w-5 h-5" /> {searching ? 'Fetching...' : 'Fetch Students'}
              </button>
            </div>
          </div>
          {errorMessage && <AlertBox type="error">{errorMessage}</AlertBox>}
          {saveStatus === 'success' && <AlertBox type="success">{SUCCESS_MESSAGES.MARKS_SAVED}</AlertBox>}
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>{TABLE_HEADERS.map(h => <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s, i) => <StudentRow key={s.id} student={s} index={i} markData={marksData[s.id]} maxMarks={MAX_MARKS} onMarksChange={handleMarksChange} onRemarksChange={handleRemarksChange} />)}
              </tbody>
            </table>
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