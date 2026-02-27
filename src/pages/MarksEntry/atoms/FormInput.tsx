import React from 'react';

interface FormInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    disabled?: boolean;
    required?: boolean;
}

export const FormInput = React.memo(({ label, value, onChange, placeholder, disabled, required }: FormInputProps) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-3 py-3 sm:px-4 sm:py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
    </div>
));
FormInput.displayName = 'FormInput';
