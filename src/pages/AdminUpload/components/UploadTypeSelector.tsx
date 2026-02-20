import React from 'react';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import type{ UploadType } from '../types';
import { UPLOAD_TYPE_OPTIONS } from '../constants';

interface UploadTypeSelectorProps {
    value: UploadType | '';
    onChange: (value: UploadType | '') => void;
    disabled: boolean;
}

export const UploadTypeSelector = React.memo(({ value, onChange, disabled }: UploadTypeSelectorProps) => (
    <div className="mb-6">
        <CustomSelect
            label="Select Upload Category"
            value={value}
            onChange={(v) => onChange(v as UploadType | '')}
            options={UPLOAD_TYPE_OPTIONS}
            disabled={disabled}
            placeholder="-- Choose Type --"
            required
        />
    </div>
));
UploadTypeSelector.displayName = 'UploadTypeSelector';
