// src/components/Signup.tsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Phone, AlertCircle } from 'lucide-react';

const SIGNUP_MUTATION = gql`
  mutation Signup($schoolName: String!, $email: String!, $password: String!, $phone: String!) {
    signup(schoolName: $schoolName, email: $email, password: $password, phone: $phone) {
      success
      message
      user {
        id
        name
        email
        role
      }
      token
    }
  }
`;

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    schoolName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [signupMutation, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      if (data.signup.success) {
        login(data.signup.user, data.signup.token);
        alert('Signup Successful!');
        navigate('/admin/dashboard');
      } else {
        alert(data.signup.message || 'Signup failed');
      }
    },
    onError: (error) => {
      alert(error.message || 'Signup failed');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!form.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Password must be at least 8 characters with letters and numbers';
    }

    if (form.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const response = await fetch('http://localhost:3000/hasura/signup', {  // Updated path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          schoolName: form.schoolName,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      login(data.user, data.token);
      alert('Signup successful!');
      navigate('/admin/dashboard');
    } else {
      alert('Signup failed: ' + data.message);
    }
  } catch (error: any) {
    console.error('Error:', error);
    alert('Network error: ' + error.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Registration</h2>
          <p className="text-gray-600 text-sm mt-2">Create your school's admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="schoolName"
                placeholder="Enter school name"
                value={form.schoolName}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.schoolName 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.schoolName && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.schoolName}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="admin@school.com"
                value={form.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Min. 8 chars, alphanumeric"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.password && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>
            {errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
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
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              'Create Admin Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}