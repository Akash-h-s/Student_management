import React from 'react';
import type { FormFieldConfig } from '../types';
import { ErrorMessage } from './ErrorMessage';

interface SignupInputProps {
    config: FormFieldConfig;
    value: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SignupInput = ({ config, value, error, onChange }: SignupInputProps) => {
    const Icon = config.icon;

    return (
        <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                {config.label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <input
                    type={config.type}
                    name={config.name}
                    placeholder={config.placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 ${error
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                />
            </div>
            {error && <ErrorMessage message={error} />}
        </div>
    );
};
