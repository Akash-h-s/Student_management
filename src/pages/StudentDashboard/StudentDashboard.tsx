// src/pages/StudentDashboard.tsx
import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';

// ==================== TYPES ====================
interface Mark {
  subject_name: string;
  exam_name: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  class: string;
  section: string;
  marks: Mark[];
}

interface StudentInfoField {
  label: string;
  key: keyof Pick<Student, 'admission_no' | 'class' | 'section'>;
}

// ==================== CONSTANTS ====================
const GET_STUDENT_DETAILS = gql`
  query GetStudentDetails($student_id: Int!) {
    students_by_pk(id: $student_id) {
      id
      name
      admission_no
      class
      section
      marks {
        subject_name
        exam_name
        marks_obtained
        max_marks
        grade
      }
    }
  }
`;

const STUDENT_INFO_FIELDS: StudentInfoField[] = [
  { label: 'Admission Number', key: 'admission_no' },
  { label: 'Class', key: 'class' },
  { label: 'Section', key: 'section' },
] as const;

const TABLE_HEADERS = ['Subject', 'Exam', 'Marks', 'Grade'] as const;

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800',
  'A': 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  'B': 'bg-blue-100 text-blue-800',
  'C': 'bg-yellow-100 text-yellow-800',
  'D': 'bg-orange-100 text-orange-800',
  'F': 'bg-red-100 text-red-800',
} as const;

const DEFAULT_GRADE_COLOR = 'bg-yellow-100 text-yellow-800';

const STYLES = {
  card: 'bg-white rounded-lg shadow-md p-6',
  title: 'text-xl font-semibold text-gray-900 mb-4',
  label: 'text-sm text-gray-600',
  value: 'font-semibold text-gray-900',
} as const;

// ==================== HELPER FUNCTIONS ====================
const getGradeColor = (grade: string): string => {
  return GRADE_COLORS[grade] || DEFAULT_GRADE_COLOR;
};

const parseStudentId = (id: string | number | undefined): number | undefined => {
  if (!id) return undefined;
  return typeof id === 'number' ? id : parseInt(id, 10);
};

// ==================== SUB-COMPONENTS ====================


const LoadingState = React.memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-gray-600">Loading...</div>
  </div>
));
LoadingState.displayName = 'LoadingState';

interface DashboardHeaderProps {
  studentName?: string;
}

const DashboardHeader = React.memo(({ studentName }: DashboardHeaderProps) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome, {studentName}!</p>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

interface InfoFieldProps {
  label: string;
  value?: string;
}

const InfoField = React.memo(({ label, value }: InfoFieldProps) => (
  <div>
    <p className={STYLES.label}>{label}</p>
    <p className={STYLES.value}>{value || '-'}</p>
  </div>
));
InfoField.displayName = 'InfoField';

interface StudentInfoCardProps {
  student?: Student;
}

const StudentInfoCard = React.memo(({ student }: StudentInfoCardProps) => (
  <div className={`${STYLES.card} mb-6`}>
    <h2 className={STYLES.title}>Student Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STUDENT_INFO_FIELDS.map((field) => (
        <InfoField
          key={field.key}
          label={field.label}
          value={student?.[field.key]}
        />
      ))}
    </div>
  </div>
));
StudentInfoCard.displayName = 'StudentInfoCard';

interface MarkRowProps {
  mark: Mark;
}

const MarkRow = React.memo(({ mark }: MarkRowProps) => {
  const gradeColor = getGradeColor(mark.grade);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{mark.subject_name}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{mark.exam_name}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {mark.marks_obtained}/{mark.max_marks}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${gradeColor}`}>
          {mark.grade}
        </span>
      </td>
    </tr>
  );
});
MarkRow.displayName = 'MarkRow';

interface AcademicPerformanceCardProps {
  marks: Mark[];
}

const AcademicPerformanceCard = React.memo(({ marks }: AcademicPerformanceCardProps) => {
  if (!marks || marks.length === 0) return null;

  return (
    <div className={STYLES.card}>
      <h2 className={STYLES.title}>Academic Performance</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {marks.map((mark, index) => (
              <MarkRow key={index} mark={mark} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
AcademicPerformanceCard.displayName = 'AcademicPerformanceCard';

// ==================== MAIN COMPONENT ====================
const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentId = useMemo(() => parseStudentId(user?.id), [user?.id]);

  const { data, loading, error } = useQuery(GET_STUDENT_DETAILS, {
    variables: { student_id: studentId },
    skip: !studentId,
  });

  const student = useMemo(() => data?.students_by_pk as Student | undefined, [data]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error loading student data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader studentName={student?.name} />
        <StudentInfoCard student={student} />
        <AcademicPerformanceCard marks={student?.marks || []} />
      </div>
    </div>
  );
};

export default StudentDashboard;