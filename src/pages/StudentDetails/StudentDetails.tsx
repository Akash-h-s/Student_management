import { useState, useCallback, useMemo } from "react";
import { useParentStudents } from "../../hooks/useParentStudents";
import { useAppSelector } from "../../store/hooks";
import axios from "axios";
import type { Student, Mark } from "./types";
import { MESSAGES, API_BASE_URL } from "./constants";
import { parseParentId, prepareMarkscardData, downloadPDF, sanitizeFilename } from "./utils";
import { LoadingState } from "./atoms/LoadingState";
import { ErrorState } from "./atoms/ErrorState";
import { GeneratingOverlay } from "./atoms/GeneratingOverlay";
import { StudentCard } from "./atoms/StudentCard";

export default function StudentDetails() {
  const user = useAppSelector((state: any) => state.auth.user);
  const parentId = useMemo(() => parseParentId(user?.id), [user?.id]);
  const [generatingMarkscard, setGeneratingMarkscard] = useState(false);

  const { students, loading, error, refetch } = useParentStudents(parentId);

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

        {students.map((student: Student) => (
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