import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import CustomSelect from '../CustomSelect/CustomSelect';


type Role = 'student' | 'parent' | 'teacher' | 'admin';



interface User {
  id: number;
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
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      autoFocus={autoFocus}
      className="w-full p-3 sm:p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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



  // Handle Login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError('');

    try {
      // Call backend login API
      const response = await authService.login({
        role,
        identifier,
        password: config.requiresPassword ? password : undefined,
        studentName: role === 'student' ? studentName : undefined,
      });

      if (response.success && response.token && response.user) {
        const user: User = {
          id: Number(response.user.id),
          name: response.user.name,
          email: response.user.email,
          role: role as Role,
        };

        login(user, response.token);
        navigate(config.route);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">EduCloud</h1>
          <p className="text-xs sm:text-sm text-gray-600">Secure Role-Based Access</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Role Selection */}
          <CustomSelect
            label="Login As"
            value={role}
            onChange={(value) => handleRoleChange(value as Role)}
            options={ROLE_OPTIONS}
          />

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