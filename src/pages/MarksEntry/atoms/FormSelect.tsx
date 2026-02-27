import React from 'react';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: readonly string[];
    disabled?: boolean;
    required?: boolean;
}

export const FormSelect = React.memo(({ label, value, onChange, options, disabled, required }: FormSelectProps) => (
    <div>
        <CustomSelect
            label={label}
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
            required={required}
            placeholder={`Select ${label}`}
        />
    </div>
));
FormSelect.displayName = 'FormSelect';
