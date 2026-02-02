// src/components/Parent/StudentDetails.tsx
import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { GET_STUDENT_DETAILS_BY_PARENT } from "../../graphql/studentsandparents";

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
}

export default function StudentDetails() {
  const { user } = useAuth();
  const parentId = user?.id ? parseInt(user.id) : null;

  const { data, loading, error, refetch } = useQuery(GET_STUDENT_DETAILS_BY_PARENT, {
    variables: { parentId },
    skip: !parentId, // Skip query if no parent ID
  });

  const students: Student[] = data?.students || [];

  // Group marks by exam for better display
  const groupMarksByExam = (marks: Mark[]) => {
    const grouped: { [key: string]: Mark[] } = {};
    
    marks.forEach((mark) => {
      const examKey = `${mark.exam.name} (${mark.exam.academic_year})`;
      if (!grouped[examKey]) {
        grouped[examKey] = [];
      }
      grouped[examKey].push(mark);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p>{error.message}</p>
            <p className="text-sm text-gray-500 mt-2">Parent ID: {user?.id || 'Not available'}</p>
            <button 
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!parentId) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold mb-2">Not Logged In</p>
            <p>Please log in to view student details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Student Details</h1>
          <p className="text-gray-600">No students found for your account.</p>
          <p className="text-sm text-gray-500 mt-2">Parent ID: {user?.id}</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Children</h1>
        
        {students.map((student) => {
          const groupedMarks = groupMarksByExam(student.marks);
          
          return (
            <div key={student.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-600">Admission No: {student.admission_no}</p>
              </div>

              <h3 className="text-xl font-semibold mb-4">Academic Performance</h3>
              
              {student.marks && student.marks.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedMarks).map(([examName, marks]) => (
                    <div key={examName} className="border rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-blue-600 mb-3">{examName}</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 border-b text-left font-semibold">Subject</th>
                              <th className="px-6 py-3 border-b text-left font-semibold">Marks Obtained</th>
                              <th className="px-6 py-3 border-b text-left font-semibold">Maximum Marks</th>
                              <th className="px-6 py-3 border-b text-left font-semibold">Percentage</th>
                              <th className="px-6 py-3 border-b text-left font-semibold">Grade</th>
                              <th className="px-6 py-3 border-b text-left font-semibold">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marks.map((mark) => {
                              const percentage = (mark.marks_obtained / mark.max_marks) * 100;
                              
                              return (
                                <tr key={mark.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 border-b">{mark.subject.name}</td>
                                  <td className="px-6 py-4 border-b">{mark.marks_obtained}</td>
                                  <td className="px-6 py-4 border-b">{mark.max_marks}</td>
                                  <td className="px-6 py-4 border-b">{percentage.toFixed(2)}%</td>
                                  <td className="px-6 py-4 border-b">
                                    <span className={`px-2 py-1 rounded font-semibold ${
                                      mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-800' :
                                      mark.grade === 'B+' || mark.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                      mark.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                      mark.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {mark.grade}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 border-b">
                                    {mark.remarks || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Summary for each exam */}
                      <div className="mt-4 p-4 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <span className="font-semibold">Total Subjects:</span> {marks.length}
                        </div>
                        <div>
                          <span className="font-semibold">Total Marks:</span>{' '}
                          {marks.reduce((sum, m) => sum + m.marks_obtained, 0)} / {marks.reduce((sum, m) => sum + m.max_marks, 0)}
                        </div>
                        <div>
                          <span className="font-semibold">Overall Percentage:</span>{' '}
                          {(
                            (marks.reduce((sum, m) => sum + m.marks_obtained, 0) /
                            marks.reduce((sum, m) => sum + m.max_marks, 0)) * 100
                          ).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No marks available yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}