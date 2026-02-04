import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, Phone, AlertCircle} from 'lucide-react';
import type{ LucideIcon} from 'lucide-react'
import { CHECK_ADMIN_EMAIL, INSERT_ADMIN } from '../../graphql/signup';


interface FormData {
  schoolName: string;
  email: string;
  password: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormFieldConfig {
  name: keyof FormData;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
}

interface InputFieldProps {
  config: FormFieldConfig;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Constants
const INITIAL_FORM_STATE: FormData = {
  schoolName: '',
  email: '',
  password: '',
  phone: '',
};

const FORM_FIELDS: FormFieldConfig[] = [
  {
    name: 'schoolName',
    label: 'School Name',
    type: 'text',
    placeholder: 'Enter school name',
    icon: Building2,
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'admin@school.com',
    icon: Mail,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Min. 8 chars, alphanumeric',
    icon: Lock,
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter phone number',
    icon: Phone,
  },
];

const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  minPhoneLength: 10,
};

const ERROR_MESSAGES = {
  schoolName: 'School name is required',
  email: 'Please enter a valid email address',
  emailExists: 'Email already registered',
  password: 'Password must be at least 8 characters with letters and numbers',
  phone: 'Please enter a valid phone number',
  signupFailed: (message: string) => `Signup failed: ${message}`,
};

const SUCCESS_MESSAGES = {
  signupSuccess: 'Signup successful!',
};

const ROUTES = {
  login: '/login',
  adminDashboard: '/admin/dashboard',
};


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

// Reusable Components
const Header = () => (
  <div className="text-center mb-8">
    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Building2 className="w-8 h-8 text-white" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900">Admin Registration</h2>
    <p className="text-gray-600 text-sm mt-2">Create your school's admin account</p>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
    <AlertCircle className="w-4 h-4" />
    <span>{message}</span>
  </div>
);

const InputField = ({ config, value, error, onChange }: InputFieldProps) => {
  const Icon = config.icon;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {config.label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={config.type}
          name={config.name}
          placeholder={config.placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

const SubmitButton = ({ loading }: { loading: boolean }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
      loading
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
    }`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <LoadingSpinner />
        Creating Account...
      </span>
    ) : (
      'Create Admin Account'
    )}
  </button>
);

const LoginLink = () => (
  <p className="text-center mt-6 text-sm text-gray-600">
    Already have an account?{' '}
    <Link to={ROUTES.login} className="text-blue-600 hover:underline font-medium">
      Login here
    </Link>
  </p>
);


export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<FormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const [checkEmail] = useLazyQuery(CHECK_ADMIN_EMAIL);
  const [insertAdmin] = useMutation(INSERT_ADMIN);

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

      // Hash password
      const passwordHash = await bcrypt.hash(form.password, 10);

      // Insert new admin
      const { data } = await insertAdmin({
        variables: {
          school_name: form.schoolName,
          email: form.email,
          password_hash: passwordHash,
          phone: form.phone,
        },
      });

      if (data?.insert_admins_one) {
        const user = {
          id: data.insert_admins_one.id.toString(),
          name: data.insert_admins_one.school_name,
          email: data.insert_admins_one.email,
          role: 'admin' as const,
        };

        const token = `jwt-${user.id}-${Date.now()}`;
        login(user, token);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <Header />

        <form onSubmit={handleSubmit} className="space-y-5">
          {FORM_FIELDS.map((config) => (
            <InputField
              key={config.name}
              config={config}
              value={form[config.name]}
              error={errors[config.name]}
              onChange={handleChange}
            />
          ))}

          <SubmitButton loading={loading} />
        </form>

        <LoginLink />
      </div>
    </div>
  );
}