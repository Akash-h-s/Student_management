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

// Type Definitions
type Role = 'student' | 'parent' | 'teacher' | 'admin';

interface UserData {
  id: string | number;
  name?: string;
  school_name?: string;
  email?: string;
  password_hash?: string;
}

interface User {
  id: number; // Changed from string
  name: string;
  email: string;
  role: Role;
}

interface RoleConfig {
  requiresPassword: boolean;
  identifierLabel: string;
  identifierType: 'text' | 'email';
  route: string;
}

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

interface ErrorMessageProps {
  message: string;
}

interface LoadingButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  requiresPassword: boolean;
}

// Constants
const ROLE_CONFIG: Record<Role, RoleConfig> = {
  student: {
    requiresPassword: false,
    identifierLabel: 'Admission Number',
    identifierType: 'text',
    route: '/student/dashboard',
  },
  parent: {
    requiresPassword: true,
    identifierLabel: 'Email Address',
    identifierType: 'email',
    route: '/parent/dashboard',
  },
  teacher: {
    requiresPassword: true,
    identifierLabel: 'Email Address',
    identifierType: 'email',
    route: '/teacher/dashboard',
  },
  admin: {
    requiresPassword: true,
    identifierLabel: 'Email Address',
    identifierType: 'email',
    route: '/admin/dashboard',
  },
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
];

const ERROR_MESSAGES = {
  IDENTIFIER_REQUIRED: (role: Role) =>
    `Please enter your ${ROLE_CONFIG[role].identifierLabel}`,
  PASSWORD_REQUIRED: (role: Role) => `${role} password is required`,
  STUDENT_NAME_REQUIRED: 'Student name is required',
  USER_NOT_FOUND: (role: Role) => `${role} not found with provided credentials`,
  INVALID_PASSWORD: 'Invalid password',
  LOGIN_FAILED: (message: string) => `Login failed: ${message}`,
};

const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
    {message}
  </div>
);

const InputField = ({
  label,
  type,
  value,
  onChange,
  onKeyPress,
  autoFocus = false
}: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      autoFocus={autoFocus}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const LoadingButton = ({
  onClick,
  disabled,
  loading,
  requiresPassword
}: LoadingButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    {loading ? (
      <span className="flex items-center justify-center">
        <LoadingSpinner />
        Signing In...
      </span>
    ) : (
      requiresPassword ? 'Sign In' : 'Verify & Enter'
    )}
  </button>
);

// Main Component
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State
  const [role, setRole] = useState<Role>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = ROLE_CONFIG[role];

  // GraphQL Queries
  const [getAdmin] = useLazyQuery(GET_ADMIN_BY_EMAIL);
  const [getTeacher] = useLazyQuery(GET_TEACHER_BY_EMAIL);
  const [getParent] = useLazyQuery(GET_PARENT_BY_EMAIL);
  const [getStudent] = useLazyQuery(GET_STUDENT_BY_ADMISSION_NUMBER);

  // Validation
  const validateInputs = (): boolean => {
    if (!identifier) {
      setError(ERROR_MESSAGES.IDENTIFIER_REQUIRED(role));
      return false;
    }

    if (config.requiresPassword && !password) {
      setError(ERROR_MESSAGES.PASSWORD_REQUIRED(role));
      return false;
    }

    if (role === 'student' && !studentName) {
      setError(ERROR_MESSAGES.STUDENT_NAME_REQUIRED);
      return false;
    }

    return true;
  };

  // Verify Password
  const verifyPassword = async (
    userPassword: string | undefined,
    inputPassword: string
  ): Promise<boolean> => {
    if (!userPassword || !inputPassword) return true;
    return await bcrypt.compare(inputPassword, userPassword);
  };

  // Fetch User Data
  const fetchUserData = async (): Promise<UserData | null> => {
    let data;

    switch (role) {
      case 'admin':
        ({ data } = await getAdmin({ variables: { email: identifier } }));
        return data?.admins?.[0] || null;

      case 'teacher':
        ({ data } = await getTeacher({ variables: { email: identifier } }));
        return data?.teachers?.[0] || null;

      case 'parent':
        ({ data } = await getParent({ variables: { email: identifier } }));
        return data?.parents?.[0] || null;

      case 'student':
        ({ data } = await getStudent({
          variables: { admissionNumber: identifier, name: studentName },
        }));
        return data?.students?.[0] || null;

      default:
        return null;
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError('');

    try {
      const userData = await fetchUserData();

      if (!userData) {
        setError(ERROR_MESSAGES.USER_NOT_FOUND(role));
        setLoading(false);
        return;
      }

      const isValidPassword = await verifyPassword(userData.password_hash, password);

      if (!isValidPassword) {
        setError(ERROR_MESSAGES.INVALID_PASSWORD);
        setLoading(false);
        return;
      }

      const user: User = {
        id: Number(userData.id),
        name: userData.name || userData.school_name || '',
        email: userData.email || identifier,
        role,
      };

      const token = `jwt-${user.id}-${Date.now()}`;
      login(user, token);
      navigate(config.route);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(ERROR_MESSAGES.LOGIN_FAILED(error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setIdentifier('');
    setPassword('');
    setStudentName('');
    setError('');
  };

  // Handle Key Press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EduCloud</h1>
          <p className="text-gray-600">Secure Role-Based Access</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        <div className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as Role)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Identifier Input */}
          <InputField
            label={config.identifierLabel}
            type={config.identifierType}
            value={identifier}
            onChange={setIdentifier}
            onKeyPress={handleKeyPress}
            autoFocus
          />

          {/* Password Input (for roles that require it) */}
          {config.requiresPassword && (
            <InputField
              label={`${role.charAt(0).toUpperCase() + role.slice(1)} Password`}
              type="password"
              value={password}
              onChange={setPassword}
              onKeyPress={handleKeyPress}
            />
          )}

          {/* Student Name Input */}
          {role === 'student' && (
            <InputField
              label="Full Name"
              type="text"
              value={studentName}
              onChange={setStudentName}
              onKeyPress={handleKeyPress}
            />
          )}

          {/* Submit Button */}
          <LoadingButton
            onClick={handleLogin}
            disabled={loading}
            loading={loading}
            requiresPassword={config.requiresPassword}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;