import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[] | readonly string[] | readonly { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select option',
    disabled = false,
    required = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const normalizedOptions: Option[] = React.useMemo(() => {
        if (options.length === 0) return [];
        if (typeof options[0] === 'string') {
            return (options as string[]).map((opt) => ({ value: opt, label: opt }));
        }
        return options as Option[];
    }, [options]);

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    const handleSelect = (newValue: string) => {
        if (!disabled) {
            onChange(newValue);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          w-full flex items-center justify-between
          px-3 py-3 sm:px-4 sm:py-3
          text-base border border-gray-300 rounded-lg
          bg-white text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:border-blue-400 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 origin-top">
                    <ul className="py-1">
                        {normalizedOptions.length > 0 ? (
                            normalizedOptions.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                      w-full flex items-center justify-between px-4 py-3 text-base text-left
                      hover:bg-blue-50 transition-colors
                      ${option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {option.value === value && (
                                            <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                                        )}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-gray-500 text-sm text-center">No options available</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
