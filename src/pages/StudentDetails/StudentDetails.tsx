// src/components/Parent/StudentDetails.tsx
import React, { useState, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { GET_ADMIN_SCHOOL_DETAILS, GET_STUDENT_DETAILS_BY_PARENT } from "../../graphql/studentsandparents";
import axios from "axios";

interface Admin {
  id: number;
  name: string;
  email: string;
  school_name?: string;
  school_address?: string;
  school_phone?: string;
  school_logo_url?: string;
}

interface Exam {
  id: number;
  name: string;
  academic_year: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Mark {
  id: number;
  subject: Subject;
  exam: Exam;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  remarks: string | null;
  entered_at: string;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  marks: Mark[];
  admin?: Admin;
  creator_admin?: Admin;
  created_by_admin_id?: number;
}

interface MarkscardData {
  student_name: string;
  admission_no: string;
  exam_name: string;
  school_name: string;
  school_address: string;
  school_phone: string;
  school_logo_url: string;
  marks: Array<{
    subject: string;
    marks_obtained: number;
    max_marks: number;
    grade: string;
    percentage: string;
    remarks: string | null;
  }>;
  total_marks: number;
  max_marks: number;
  overall_percentage: string;
  date: string;
}

// ==================== CONSTANTS ====================
const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_SCHOOL_NAME = 'ACADEMIC INSTITUTION';

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800',
  'A': 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  'B': 'bg-blue-100 text-blue-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-orange-100 text-orange-800',
  'F': 'bg-red-100 text-red-800',
} as const;

const DEFAULT_GRADE_COLOR = 'bg-red-100 text-red-800';

const TABLE_HEADERS = [
  'Subject',
  'Marks Obtained',
  'Maximum Marks',
  'Percentage',
  'Grade',
  'Remarks',
] as const;

const MESSAGES = {
  LOADING: 'Loading student details...',
  ERROR: 'Error',
  NOT_LOGGED_IN: 'Not Logged In',
  LOGIN_REQUIRED: 'Please log in to view student details.',
  NO_STUDENTS: 'No students found for your account.',
  NO_MARKS: 'No marks available yet.',
  GENERATING: 'Generating Markscard...',
  GENERATING_WAIT: 'Please wait while AI creates your markscard',
  SUCCESS: 'Markscard generated successfully!',
  FAILED: 'Failed to generate markscard. Please try again.',
} as const;

const BUTTON_STYLES = {
  primary: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
  gradient: 'w-full mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

const STYLES = {
  card: 'bg-white rounded-lg shadow-md p-4 md:p-6',
  table: 'min-w-full bg-white border',
  tableHeader: 'px-2 md:px-6 py-2 md:py-3 border-b text-left font-semibold text-xs md:text-sm',
  tableCell: 'px-2 md:px-6 py-2 md:py-4 border-b text-xs md:text-sm',
  tableRow: 'hover:bg-gray-50',
} as const;

// ==================== HELPER FUNCTIONS ====================
const parseParentId = (id: string | number | undefined): number | null => {
  if (!id) return null;
  return typeof id === 'number' ? id : parseInt(id, 10);
};

const getGradeColor = (grade: string): string => {
  return GRADE_COLORS[grade] || DEFAULT_GRADE_COLOR;
};

const calculatePercentage = (obtained: number, max: number): string => {
  return ((obtained / max) * 100).toFixed(2);
};

const groupMarksByExam = (marks: Mark[]): Record<string, Mark[]> => {
  const grouped: Record<string, Mark[]> = {};
  const seenExamIds = new Set<number>();
  const examKeyMapping: Record<number, string> = {};
  const seenSubjectsByExam: Record<number, Set<number>> = {};

  marks.forEach((mark) => {
    const examId = mark.exam.id;

    // Initialize exam tracking if first time seeing this exam
    if (!seenExamIds.has(examId)) {
      seenExamIds.add(examId);
      examKeyMapping[examId] = `${mark.exam.name} (${mark.exam.academic_year})`;
      seenSubjectsByExam[examId] = new Set<number>();
    }

    // Use exam.id + subject.id to prevent duplicate subjects in same exam
    if (!seenSubjectsByExam[examId].has(mark.subject.id)) {
      seenSubjectsByExam[examId].add(mark.subject.id);
      const examKey = examKeyMapping[examId];
      if (!grouped[examKey]) {
        grouped[examKey] = [];
      }
      grouped[examKey].push(mark);
    }
  });

  return grouped;
};

const calculateTotalMarks = (marks: Mark[]): { total: number; max: number; percentage: string } => {
  const total = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
  const max = marks.reduce((sum, m) => sum + m.max_marks, 0);
  const percentage = calculatePercentage(total, max);
  return { total, max, percentage };
};

const prepareMarkscardData = (student: Student, marks: Mark[], examName: string): MarkscardData => {
  const { total, max, percentage } = calculateTotalMarks(marks);

  // Use admin for legacy support, or fallback to defaults
  // Note: Backend service (markscard_generator.py) will fetch correct school details using student's created_by_admin_id
  const schoolAdmin = student.admin;

  return {
    student_name: student.name,
    admission_no: student.admission_no,
    exam_name: examName,
    school_name: schoolAdmin?.school_name || DEFAULT_SCHOOL_NAME,
    school_address: schoolAdmin?.school_address || '',
    school_phone: schoolAdmin?.school_phone || '',
    school_logo_url: schoolAdmin?.school_logo_url || '',
    marks: marks.map((m) => ({
      subject: m.subject.name,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      grade: m.grade,
      percentage: calculatePercentage(m.marks_obtained, m.max_marks),
      remarks: m.remarks,
    })),
    total_marks: total,
    max_marks: max,
    overall_percentage: percentage,
    date: new Date().toLocaleDateString(),
  };
};

const downloadPDF = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const sanitizeFilename = (name: string, examName: string): string => {
  return `${name}_${examName.replace(/[^a-z0-9]/gi, '_')}_Markscard.pdf`;
};

// ==================== SUB-COMPONENTS ====================
const LoadingSpinner = React.memo(() => (
  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
));
LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = React.memo(({ message = MESSAGES.LOADING }: LoadingStateProps) => (
  <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
));
LoadingState.displayName = 'LoadingState';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  additionalInfo?: string;
}

const ErrorState = React.memo(({ title, message, onRetry, additionalInfo }: ErrorStateProps) => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className={`max-w-4xl mx-auto ${STYLES.card}`}>
      <div className="text-center text-red-600">
        <p className="text-xl font-semibold mb-2">{title}</p>
        <p>{message}</p>
        {additionalInfo && <p className="text-sm text-gray-500 mt-2">{additionalInfo}</p>}
        {onRetry && (
          <button onClick={onRetry} className={`mt-4 ${BUTTON_STYLES.primary}`}>
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
));
ErrorState.displayName = 'ErrorState';

interface GeneratingOverlayProps {
  isGenerating: boolean;
}

const GeneratingOverlay = React.memo(({ isGenerating }: GeneratingOverlayProps) => {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <LoadingSpinner />
        <p className="text-gray-700 font-semibold">{MESSAGES.GENERATING}</p>
        <p className="text-gray-500 text-sm mt-2">{MESSAGES.GENERATING_WAIT}</p>
      </div>
    </div>
  );
});
GeneratingOverlay.displayName = 'GeneratingOverlay';

interface SchoolInfoProps {
  adminId?: number;
}

const SchoolInfo = React.memo(({ adminId }: SchoolInfoProps) => {
  const { data, loading } = useQuery(GET_ADMIN_SCHOOL_DETAILS, {
    variables: { adminId },
    skip: !adminId
  });

  const admin = data?.admins_by_pk;

  if (loading) return null;
  if (!admin?.school_name) return null;

  return (
    <div className="text-left md:text-right">
      <p className="text-xs md:text-sm font-semibold text-gray-700">{admin.school_name}</p>
      {admin.school_address && <p className="text-xs text-gray-500">{admin.school_address}</p>}
      {admin.school_phone && <p className="text-xs text-gray-500">{admin.school_phone}</p>}
    </div>
  );
});
SchoolInfo.displayName = 'SchoolInfo';

interface MarkRowProps {
  mark: Mark;
}

const MarkRow = React.memo(({ mark }: MarkRowProps) => {
  const percentage = calculatePercentage(mark.marks_obtained, mark.max_marks);
  const gradeColor = getGradeColor(mark.grade);

  return (
    <tr className={STYLES.tableRow}>
      <td className={STYLES.tableCell}>
        <span className="truncate block max-w-[100px] md:max-w-none">{mark.subject.name}</span>
      </td>
      <td className={STYLES.tableCell}>{mark.marks_obtained}</td>
      <td className={STYLES.tableCell}>{mark.max_marks}</td>
      <td className={STYLES.tableCell}>{percentage}%</td>
      <td className={STYLES.tableCell}>
        <span className={`px-1 md:px-2 py-1 rounded font-semibold text-xs md:text-sm inline-block ${gradeColor}`}>{mark.grade}</span>
      </td>
      <td className={STYLES.tableCell}>
        <span className="text-xs block truncate max-w-[80px] md:max-w-none">{mark.remarks || '-'}</span>
      </td>
    </tr>
  );
});
MarkRow.displayName = 'MarkRow';

interface ExamSummaryProps {
  marks: Mark[];
  onPrintMarkscard: () => void;
  isGenerating: boolean;
}

const ExamSummary = React.memo(({ marks, onPrintMarkscard, isGenerating }: ExamSummaryProps) => {
  const { total, max, percentage } = useMemo(() => calculateTotalMarks(marks), [marks]);

  return (
    <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded">
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 mb-3">
        <div className="text-xs md:text-sm">
          <span className="font-semibold">Total Subjects:</span> {marks.length}
        </div>
        <div className="text-xs md:text-sm">
          <span className="font-semibold">Total Marks:</span> {total} / {max}
        </div>
        <div className="text-xs md:text-sm">
          <span className="font-semibold">Overall Percentage:</span> {percentage}%
        </div>
      </div>
      <button onClick={onPrintMarkscard} disabled={isGenerating} className="w-full mt-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 md:h-5 w-4 md:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        <span>{isGenerating ? 'Generating...' : 'Print Markscard'}</span>
      </button>
    </div>
  );
});
ExamSummary.displayName = 'ExamSummary';

interface ExamSectionProps {
  examName: string;
  marks: Mark[];
  onPrintMarkscard: () => void;
  isGenerating: boolean;
}

const ExamSection = React.memo(({ examName, marks, onPrintMarkscard, isGenerating }: ExamSectionProps) => (
  <div className="border rounded-lg p-3 md:p-4">
    <h4 className="text-base md:text-lg font-semibold text-blue-600 mb-3">{examName}</h4>

    <div className="overflow-x-auto -mx-3 md:mx-0">
      <table className={`${STYLES.table} min-w-[700px] md:min-w-full`}>
        <thead className="bg-gray-50">
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th key={header} className={STYLES.tableHeader}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {marks.map((mark) => (
            <MarkRow key={mark.id} mark={mark} />
          ))}
        </tbody>
      </table>
    </div>

    <ExamSummary marks={marks} onPrintMarkscard={onPrintMarkscard} isGenerating={isGenerating} />
  </div>
));
ExamSection.displayName = 'ExamSection';

interface StudentCardProps {
  student: Student;
  onPrintMarkscard: (student: Student, marks: Mark[], examName: string) => void;
  isGenerating: boolean;
}

const StudentCard = React.memo(({ student, onPrintMarkscard, isGenerating }: StudentCardProps) => {
  const groupedMarks = useMemo(() => groupMarksByExam(student.marks), [student.marks]);

  return (
    <div className={`${STYLES.card} mb-6`}>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-sm md:text-base text-gray-600">Admission No: {student.admission_no}</p>
          </div>
          <div className="w-full md:w-auto">
            <SchoolInfo adminId={student.created_by_admin_id} />
          </div>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-semibold mb-4">Academic Performance</h3>

      {student.marks && student.marks.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedMarks).map(([examName, marks]) => (
            <ExamSection
              key={examName}
              examName={examName}
              marks={marks}
              onPrintMarkscard={() => onPrintMarkscard(student, marks, examName)}
              isGenerating={isGenerating}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{MESSAGES.NO_MARKS}</p>
      )}
    </div>
  );
});
StudentCard.displayName = 'StudentCard';

// ==================== MAIN COMPONENT ====================
export default function StudentDetails() {
  const { user } = useAuth();
  const parentId = useMemo(() => parseParentId(user?.id), [user?.id]);
  const [generatingMarkscard, setGeneratingMarkscard] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_STUDENT_DETAILS_BY_PARENT, {
    variables: { parentId },
    skip: !parentId,
  });

  const students: Student[] = useMemo(() => data?.students || [], [data?.students]);

  const handlePrintMarkscard = useCallback(
    async (student: Student, marks: Mark[], examName: string) => {
      try {
        setGeneratingMarkscard(true);

        const markscardData = prepareMarkscardData(student, marks, examName);

        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/generate-markscard`, markscardData, {
          responseType: 'blob',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const filename = sanitizeFilename(student.name, examName);
        downloadPDF(blob, filename);

        alert(MESSAGES.SUCCESS);
      } catch (error) {
        console.error('Error generating markscard:', error);
        alert(MESSAGES.FAILED);
      } finally {
        setGeneratingMarkscard(false);
      }
    },
    []
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        title={MESSAGES.ERROR}
        message={error.message}
        onRetry={() => refetch()}
        additionalInfo={`Parent ID: ${user?.id || 'Not available'}`}
      />
    );
  }

  if (!parentId) {
    return <ErrorState title={MESSAGES.NOT_LOGGED_IN} message={MESSAGES.LOGIN_REQUIRED} />;
  }

  if (students.length === 0) {
    return (
      <ErrorState
        title="Student Details"
        message={MESSAGES.NO_STUDENTS}
        onRetry={() => refetch()}
        additionalInfo={`Parent ID: ${user?.id}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">My Children</h1>

        <GeneratingOverlay isGenerating={generatingMarkscard} />

        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onPrintMarkscard={handlePrintMarkscard}
            isGenerating={generatingMarkscard}
          />
        ))}
      </div>
    </div>
  );
}