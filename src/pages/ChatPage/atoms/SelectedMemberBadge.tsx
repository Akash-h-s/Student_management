import React from 'react';
import type { User } from '../types';
import { X } from 'lucide-react';

interface SelectedMemberBadgeProps {
    member: User;
    onRemove: (id: number) => void;
}

export const SelectedMemberBadge = React.memo(({ member, onRemove }: SelectedMemberBadgeProps) => (
    <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
        <span>{member.name}</span>
        <button
            onClick={() => onRemove(member.id)}
            className="hover:bg-purple-200 rounded-full p-0.5"
        >
            <X className="w-3 h-3" />
        </button>
    </div>
));
SelectedMemberBadge.displayName = 'SelectedMemberBadge';
