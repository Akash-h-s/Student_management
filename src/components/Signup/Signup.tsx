import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import { CHECK_ADMIN_EMAIL } from '../../graphql/signup';
import { authService } from '../../services/authService';
import { SignupHeader } from './atoms/SignupHeader';
import { SignupInput } from './atoms/SignupInput';
import { SignupButton } from './atoms/SignupButton';
import { LoginRedirect } from './atoms/LoginRedirect';
import { FORM_FIELDS, INITIAL_FORM_STATE, VALIDATION_RULES, ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from './constants';
import type{ FormData, FormErrors } from './types';

const validateForm = (form: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!form.schoolName.trim()) {
    errors.schoolName = ERROR_MESSAGES.schoolName;
  }

  if (!VALIDATION_RULES.email.test(form.email)) {
    errors.email = ERROR_MESSAGES.email;
  }

  if (!VALIDATION_RULES.password.test(form.password)) {
    errors.password = ERROR_MESSAGES.password;
  }

  if (form.phone.length < VALIDATION_RULES.minPhoneLength) {
    errors.phone = ERROR_MESSAGES.phone;
  }

  return errors;
};

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<FormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const [checkEmail] = useLazyQuery(CHECK_ADMIN_EMAIL);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: emailCheck } = await checkEmail({
        variables: { email: form.email },
      });

      if (emailCheck?.admins && emailCheck.admins.length > 0) {
        setErrors({ email: ERROR_MESSAGES.emailExists });
        setLoading(false);
        return;
      }

      // Call backend signup API
      const response = await authService.signup({
        schoolName: form.schoolName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      if (response.success && response.token && response.user) {
        // Dispatch login action
        dispatch(loginUser(response.token));

        alert(SUCCESS_MESSAGES.signupSuccess);
        navigate(ROUTES.adminDashboard);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(ERROR_MESSAGES.signupFailed(error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-xs sm:max-w-md bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-xl p-5 sm:p-6 md:p-8">
        <SignupHeader />

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          {FORM_FIELDS.map((config) => (
            <SignupInput
              key={config.name}
              config={config}
              value={form[config.name]}
              error={errors[config.name]}
              onChange={handleChange}
            />
          ))}

          <SignupButton loading={loading} />
        </form>

        <LoginRedirect />
      </div>
    </div>
  );
}