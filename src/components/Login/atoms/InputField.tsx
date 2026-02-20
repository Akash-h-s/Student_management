

interface InputFieldProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    onKeyPress: (e: React.KeyboardEvent) => void;
    autoFocus?: boolean;
}

export const InputField = ({
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
