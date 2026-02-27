import React from 'react';
import type { User } from '../types';
import { Check } from 'lucide-react';

interface GroupMemberItemProps {
    parent: User;
    isSelected: boolean;
    onToggle: (parent: User) => void;
}

export const GroupMemberItem = React.memo(({ parent, isSelected, onToggle }: GroupMemberItemProps) => (
    <button
        onClick={() => onToggle(parent)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
                <h3 className="font-medium text-gray-900">{parent.name}</h3>
                <p className="text-sm text-gray-500">{parent.email}</p>
            </div>
        </div>
    </button>
));
GroupMemberItem.displayName = 'GroupMemberItem';
