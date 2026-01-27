import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface Mark {
  id: number;
  subject: {
    name: string;
  };
  marks_obtained: number;
  max_marks: number;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  marks: Mark[];
}

export default function StudentDetails() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch if user is loaded
    if (user?.id) {
      fetchStudentDetails();
    } else {
      setLoading(false);
      setError("User not logged in");
    }
  }, [user?.id]); // Add user.id as dependency

  const fetchStudentDetails = async () => {
    if (!user?.id) {
      setError("User ID not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors
      
      console.log('Fetching for parent ID:', user.id);
      
      const response = await fetch('http://localhost:3000/hasura/get-student-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            parentId: parseInt(user.id)
          }
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Student details response:', data);

      if (data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch student details');
      }
    } catch (err: any) {
      console.error('Error fetching student details:', err);
      setError('Failed to fetch student details: ' + err.message);
    } finally {
      setLoading(false);
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
            <p>{error}</p>
            <p className="text-sm text-gray-500 mt-2">Parent ID: {user?.id || 'Not available'}</p>
            <button 
              onClick={fetchStudentDetails}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
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
            onClick={fetchStudentDetails}
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
        
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-600">Admission No: {student.admission_no}</p>
            </div>

            <h3 className="text-xl font-semibold mb-4">Academic Performance</h3>
            
            {student.marks && student.marks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 border-b text-left font-semibold">Subject</th>
                      <th className="px-6 py-3 border-b text-left font-semibold">Marks Obtained</th>
                      <th className="px-6 py-3 border-b text-left font-semibold">Maximum Marks</th>
                      <th className="px-6 py-3 border-b text-left font-semibold">Percentage</th>
                      <th className="px-6 py-3 border-b text-left font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.marks.map((mark) => {
                      const percentage = (mark.marks_obtained / mark.max_marks) * 100;
                      const grade = percentage >= 90 ? 'A+' : 
                                   percentage >= 80 ? 'A' : 
                                   percentage >= 70 ? 'B' : 
                                   percentage >= 60 ? 'C' : 
                                   percentage >= 50 ? 'D' : 'F';
                      
                      return (
                        <tr key={mark.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 border-b">{mark.subject.name}</td>
                          <td className="px-6 py-4 border-b">{mark.marks_obtained}</td>
                          <td className="px-6 py-4 border-b">{mark.max_marks}</td>
                          <td className="px-6 py-4 border-b">{percentage.toFixed(2)}%</td>
                          <td className="px-6 py-4 border-b">
                            <span className={`px-2 py-1 rounded ${
                              grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                              grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No marks available yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}