import React from 'react';
import type { Chat } from '../types';
import { CHAT_COLORS } from '../constants';
import { getInitials } from '../utils';
import { Users } from 'lucide-react';

interface ChatHeaderProps {
    chat: Chat;
    isTeacher: boolean;
    onBack?: () => void;
}

export const ChatHeader = React.memo(({ chat, isTeacher, onBack }: ChatHeaderProps) => (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
            {/* Back button only on small screens */}
            {onBack && (
                <button onClick={onBack} className="md:hidden p-2 rounded-md hover:bg-gray-100 mr-1">
                    ←
                </button>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${CHAT_COLORS[chat.type]
                }`}>
                {chat.type === 'group' ? <Users className="w-5 h-5" /> : getInitials(chat.name)}
            </div>
            <div>
                <h2 className="font-semibold text-gray-900">{chat.name}</h2>
                <p className="text-xs text-gray-500">
                    {chat.type === 'group' ?
                        `Group • ${chat.participants.length + 1} members` :
                        isTeacher ? 'Parent' : 'Teacher'}
                </p>
            </div>
        </div>
    </div>
));
ChatHeader.displayName = 'ChatHeader';
