import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';
import { findSimilarSubject } from '../utils';
import type { Subject } from '../types';

interface SubjectSelectWithNewProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    subjects: Subject[];
    disabled?: boolean;
    required?: boolean;
    onAddNew: (name: string) => void;
}

export const SubjectSelectWithNew = React.memo(({
    label,
    value,
    onChange,
    subjects,
    disabled,
    required,
    onAddNew
}: SubjectSelectWithNewProps) => {
    const [showAddNew, setShowAddNew] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [similarSuggestion, setSimilarSuggestion] = useState<Subject | undefined>();

    const handleAddNew = () => {
        if (newSubjectName.trim()) {
            // Check for similar subjects
            const similar = findSimilarSubject(newSubjectName, subjects);
            if (similar) {
                setSimilarSuggestion(similar);
                return;
            }
            onAddNew(newSubjectName.trim());
            setNewSubjectName('');
            setShowAddNew(false);
            setSimilarSuggestion(undefined);
        }
    };

    const handleUseSimilar = (subject: Subject) => {
        onChange(subject.name);
        setShowAddNew(false);
        setNewSubjectName('');
        setSimilarSuggestion(undefined);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {!showAddNew ? (
                <div className="flex gap-2">
                    <CustomSelect
                        value={value}
                        onChange={(v) => {
                            onChange(v);
                            setSimilarSuggestion(undefined);
                        }}
                        options={subjects.map(s => ({ value: s.name, label: s.name }))}
                        disabled={disabled}
                        className="flex-1"
                        placeholder="Select Subject"
                    />
                    <button
                        type="button"
                        onClick={() => setShowAddNew(true)}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
                        title="Add New Subject"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                    {similarSuggestion ? (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <p className="text-yellow-800 font-medium">Similar subject found:</p>
                            <p className="text-yellow-700 mt-1">Did you mean "<strong>{similarSuggestion.name}</strong>"?</p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => handleUseSimilar(similarSuggestion)}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 flex-1 sm:flex-none"
                                >
                                    Yes, Use It
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSimilarSuggestion(undefined)}
                                    className="px-4 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 flex-1 sm:flex-none"
                                >
                                    No, Add New
                                </button>
                            </div>
                        </div>
                    ) : null}
                    <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Enter new subject name (e.g., Mathematics)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAddNew();
                        }}
                    />
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleAddNew}
                            className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                        >
                            Create Subject
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddNew(false);
                                setNewSubjectName('');
                                setSimilarSuggestion(undefined);
                            }}
                            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium flex items-center gap-1"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

SubjectSelectWithNew.displayName = 'SubjectSelectWithNew';
