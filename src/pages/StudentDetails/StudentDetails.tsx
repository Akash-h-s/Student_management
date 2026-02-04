// src/components/Parent/StudentDetails.tsx
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { GET_STUDENT_DETAILS_BY_PARENT } from "../../graphql/studentsandparents";
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
}

export default function StudentDetails() {
  const { user } = useAuth();
  const parentId = user?.id ? parseInt(user.id) : null;
  const [generatingMarkscard, setGeneratingMarkscard] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_STUDENT_DETAILS_BY_PARENT, {
    variables: { parentId },
    skip: !parentId,
  });

  const students: Student[] = data?.students || [];

  // Group marks by exam with case-insensitive handling
  const groupMarksByExam = (marks: Mark[]) => {
    const grouped: { [key: string]: Mark[] } = {};
    const keyMapping: { [lowerKey: string]: string } = {}; // Track original case
    
    marks.forEach((mark) => {
      // Create exam key with proper formatting
      const examKey = `${mark.exam.name} (${mark.exam.academic_year})`;
      const lowerKey = examKey.toLowerCase();
      
      // If we haven't seen this exam before (case-insensitive)
      if (!keyMapping[lowerKey]) {
        // Use the first occurrence's capitalization
        keyMapping[lowerKey] = examKey;
        grouped[examKey] = [];
      }
      
      // Add mark to the appropriate group using the original key
      const originalKey = keyMapping[lowerKey];
      if (!grouped[originalKey]) {
        grouped[originalKey] = [];
      }
      grouped[originalKey].push(mark);
    });
    
    return grouped;
  };

  // Handle markscard generation with school info
  const handlePrintMarkscard = async (student: Student, marks: Mark[], examName: string) => {
    try {
      setGeneratingMarkscard(true);
      
      // Calculate overall performance
      const totalMarks = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
      const maxMarks = marks.reduce((sum, m) => sum + m.max_marks, 0);
      const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
      
      // Prepare data for markscard generation
      const markscardData = {
        student_name: student.name,
        admission_no: student.admission_no,
        exam_name: examName,
        // School/Institution information
        school_name: student.admin?.school_name || "ACADEMIC INSTITUTION",
        school_address: student.admin?.school_address || "",
        school_phone: student.admin?.school_phone || "",
        school_logo_url: student.admin?.school_logo_url || "",
        // Marks data
        marks: marks.map(m => ({
          subject: m.subject.name,
          marks_obtained: m.marks_obtained,
          max_marks: m.max_marks,
          grade: m.grade,
          percentage: ((m.marks_obtained / m.max_marks) * 100).toFixed(2),
          remarks: m.remarks
        })),
        total_marks: totalMarks,
        max_marks: maxMarks,
        overall_percentage: percentage,
        date: new Date().toLocaleDateString()
      };

      // Call Python backend API
      const response = await axios.post(
        'http://localhost:5000/api/generate-markscard',
        markscardData,
        {
          responseType: 'blob' // Important for PDF download
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.name}_${examName.replace(/[^a-z0-9]/gi, '_')}_Markscard.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Markscard generated successfully!');
    } catch (error) {
      console.error('Error generating markscard:', error);
      alert('Failed to generate markscard. Please try again.');
    } finally {
      setGeneratingMarkscard(false);
    }
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
        
        {generatingMarkscard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Generating Markscard...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while AI creates your markscard</p>
            </div>
          </div>
        )}
        
        {students.map((student) => {
          const groupedMarks = groupMarksByExam(student.marks);
          
          return (
            <div key={student.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                    <p className="text-gray-600">Admission No: {student.admission_no}</p>
                  </div>
                  {student.admin?.school_name && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{student.admin.school_name}</p>
                      {student.admin.school_address && (
                        <p className="text-xs text-gray-500">{student.admin.school_address}</p>
                      )}
                      {student.admin.school_phone && (
                        <p className="text-xs text-gray-500">{student.admin.school_phone}</p>
                      )}
                    </div>
                  )}
                </div>
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
                      
                   
                      <div className="mt-4 p-4 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-3">
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
                        <button
                          onClick={() => handlePrintMarkscard(student, marks, examName)}
                          disabled={generatingMarkscard}
                          className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          {generatingMarkscard ? 'Generating...' : 'Print Markscard'}
                        </button>
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
