import React from 'react';
import type { User } from '../types';
import { getInitials } from '../utils';

interface ParentListItemProps {
    parent: User;
    onSelect: (parent: User) => void;
}

export const ParentListItem = React.memo(({ parent, onSelect }: ParentListItemProps) => (
    <button
        onClick={() => onSelect(parent)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                {getInitials(parent.name)}
            </div>
            <div>
                <h3 className="font-medium text-gray-900">{parent.name}</h3>
                <p className="text-sm text-gray-500">{parent.email}</p>
                {parent.student_name && (
                    <p className="text-xs text-gray-400">Parent of {parent.student_name}</p>
                )}
            </div>
        </div>
    </button>
));
ParentListItem.displayName = 'ParentListItem';
