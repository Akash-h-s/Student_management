// src/pages/StudentDashboard.tsx
import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Calendar } from 'lucide-react';

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

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data, loading, error } = useQuery(GET_STUDENT_DETAILS, {
    variables: { student_id: user?.id },
    skip: !user?.id,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const student = data?.students_by_pk;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {student?.name}!</p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Admission Number</p>
              <p className="font-semibold text-gray-900">{student?.admission_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-semibold text-gray-900">{student?.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Section</p>
              <p className="font-semibold text-gray-900">{student?.section}</p>
            </div>
          </div>
        </div>

        {/* Marks Card */}
        {student?.marks && student.marks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Exam</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {student.marks.map((mark: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{mark.subject_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{mark.exam_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mark.marks_obtained}/{mark.max_marks}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                          mark.grade === 'A+' || mark.grade === 'A' 
                            ? 'bg-green-100 text-green-800'
                            : mark.grade === 'B+' || mark.grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}