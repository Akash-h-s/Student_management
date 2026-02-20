import React from 'react';

interface FileUploadInputProps {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

export const FileUploadInput = React.memo(({ onChange, disabled }: FileUploadInputProps) => (
    <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose File (Excel/PDF) <span className="text-red-500">*</span>
        </label>
        <input
            type="file"
            accept=".pdf, .xls, .xlsx"
            onChange={onChange}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        />
    </div>
));
FileUploadInput.displayName = 'FileUploadInput';
