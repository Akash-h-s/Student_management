// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import bcrypt from 'bcryptjs';
import { useAuth } from '../../context/AuthContext';
import {
  GET_ADMIN_BY_EMAIL,
  GET_TEACHER_BY_EMAIL,
  GET_PARENT_BY_EMAIL,
  GET_STUDENT_BY_ADMISSION_NUMBER,
} from '../../graphql/login';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requiresPassword = role === 'admin' || role === 'teacher' || role === 'parent';

  const [getAdmin] = useLazyQuery(GET_ADMIN_BY_EMAIL);
  const [getTeacher] = useLazyQuery(GET_TEACHER_BY_EMAIL);
  const [getParent] = useLazyQuery(GET_PARENT_BY_EMAIL);
  const [getStudent] = useLazyQuery(GET_STUDENT_BY_ADMISSION_NUMBER);

  const handleLogin = async () => {
    if (!identifier) {
      return setError(`Please enter your ${role === 'student' ? 'Admission Number' : 'Email'}`);
    }

    if (requiresPassword && !password) {
      return setError(`${role} password is required`);
    }

    if (role === 'student' && !studentName) {
      return setError('Student name is required');
    }

    setLoading(true);
    setError('');

    try {
      let userData: any = null;
      let isValidPassword = true;

      switch (role) {
        case 'admin': {
          const { data } = await getAdmin({ variables: { email: identifier } });
          if (data?.admins && data.admins.length > 0) {
            userData = data.admins[0];
            if (password && userData.password_hash) {
              isValidPassword = await bcrypt.compare(password, userData.password_hash);
            }
          }
          break;
        }

        case 'teacher': {
          const { data } = await getTeacher({ variables: { email: identifier } });
          if (data?.teachers && data.teachers.length > 0) {
            userData = data.teachers[0];
            if (password && userData.password_hash) {
              isValidPassword = await bcrypt.compare(password, userData.password_hash);
            }
          }
          break;
        }

        case 'parent': {
          const { data } = await getParent({ variables: { email: identifier } });
          if (data?.parents && data.parents.length > 0) {
            userData = data.parents[0];
            if (password && userData.password_hash) {
              isValidPassword = await bcrypt.compare(password, userData.password_hash);
            }
          }
          break;
        }

        case 'student': {
          const { data } = await getStudent({
            variables: {
              admissionNumber: identifier,
              name: studentName,
            },
          });
          if (data?.students && data.students.length > 0) {
            userData = data.students[0];
          }
          break;
        }
      }

      if (!userData) {
        setError(`${role} not found with provided credentials`);
        setLoading(false);
        return;
      }

      if (!isValidPassword) {
        setError('Invalid password');
        setLoading(false);
        return;
      }
      const user = {
        id: userData.id?.toString() || '',
        name: userData.name || userData.school_name || '',
        email: userData.email || identifier,
        role: role,
      };

      const token = `jwt-${user.id}-${Date.now()}`;
      login(user, token);

      const routes: Record<string, string> = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        parent: '/parent/dashboard',
        student: '/student/dashboard',
      };

      navigate(routes[role] || '/');
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EduCloud</h1>
          <p className="text-gray-600">Secure Role-Based Access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as any);
                setIdentifier('');
                setPassword('');
                setStudentName('');
                setError('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {role === 'student' ? 'Admission Number' : 'Email Address'}
            </label>
            <input
              type={role === 'student' ? 'text' : 'email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
          </div>

          {requiresPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {role.charAt(0).toUpperCase() + role.slice(1)} Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              requiresPassword ? 'Sign In' : 'Verify & Enter'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;