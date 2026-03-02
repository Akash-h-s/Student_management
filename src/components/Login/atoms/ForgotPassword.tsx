
import React, { useState } from 'react';
import { authService } from '../../../services/authService';
import { InputField } from './InputField';
import { ErrorMessage } from './ErrorMessage';
import type { Role } from '../types';

interface ForgotPasswordProps {
    onBack: () => void;
    onSuccess: () => void;
    role: Role;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess, role }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerifyEmail = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await authService.forgotPassword({ email, role });
            if (response.success) {
                setStep(2);
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.resetPassword({ email, role, newPassword });
            if (response.success) {
                setSuccess('Password reset successfully! Redirecting...');
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    {step === 1
                        ? `Enter your registered ${role} email`
                        : 'Enter your new password'}
                </p>
            </div>

            {error && <ErrorMessage message={error} />}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                    {success}
                </div>
            )}

            {step === 1 ? (
                <>
                    <InputField
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        onKeyPress={() => { }}
                        autoFocus
                    />
                    <button
                        onClick={handleVerifyEmail}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : null}
                        Verify Email
                    </button>
                </>
            ) : (
                <>
                    <InputField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        onKeyPress={() => { }}
                        autoFocus
                    />
                    <InputField
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        onKeyPress={() => { }}
                    />
                    <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : null}
                        Save Password
                    </button>
                </>
            )}

            <button
                onClick={onBack}
                className="text-sm text-blue-600 hover:underline block mx-auto mt-4"
            >
                Back to Login
            </button>
        </div>
    );
};

export default ForgotPassword;
