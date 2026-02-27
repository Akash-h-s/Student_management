import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import CustomSelect from '../CustomSelect/CustomSelect';

import type { Role } from './types';
import { ROLE_CONFIG, ROLE_OPTIONS, ERROR_MESSAGES } from './constants';
import { ErrorMessage } from './atoms/ErrorMessage';
import { InputField } from './atoms/InputField';
import { LoadingButton } from './atoms/LoadingButton';

// Main Component
function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

      if (response.success && response.token) {
        dispatch(loginUser(response.token));
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