// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  const requiresPassword = role === 'admin' || role === 'teacher' || role === 'parent';

  const handleLogin = async () => {
    if (!identifier) {
      return alert(`Please enter your ${role === 'student' ? 'Admission Number' : 'Email'}`);
    }

    if (requiresPassword && !password) {
      return alert(`${role} password is required`);
    }

    if (role === 'student' && !studentName) {
      return alert('Student name is required');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/hasura/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            role: role.toLowerCase(),
            identifier,
            password: requiresPassword ? password : null,
            studentName: role === 'student' ? studentName : null,
          }
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Store user data with role-specific IDs in auth context
        login(data.user, data.token);
        alert(`Welcome, ${data.user.name}`);

        // Role-based navigation
        switch (data.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'parent':
            navigate('/parent/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EduCloud</h1>
          <p className="text-gray-600">Secure Role-Based Access</p>
        </div>

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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {requiresPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {role} Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : requiresPassword ? 'Sign In' : 'Verify & Enter'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;