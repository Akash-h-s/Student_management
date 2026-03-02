import React from 'react';
import type { Chat } from '../types';
import { CHAT_COLORS } from '../constants';
import { getInitials, formatTime } from '../utils';
import { Users } from 'lucide-react';

interface ChatListItemProps {
    chat: Chat;
    isSelected: boolean;
    currentUserId: number;
    onSelect: (chat: Chat) => void;
}

export const ChatListItem = React.memo(({ chat, isSelected, currentUserId, onSelect }: ChatListItemProps) => (
    <button
        onClick={() => onSelect(chat)}
        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''
            }`}
    >
        <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${CHAT_COLORS[chat.type]
                }`}>
                {chat.type === 'group' ? <Users className="w-6 h-6" /> : getInitials(chat.name)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                    {chat.last_message && (
                        <span className="text-xs text-gray-500 ml-2">
                            {formatTime(chat.last_message.timestamp)}
                        </span>
                    )}
                </div>
                {chat.last_message && (
                    <p className="text-sm text-gray-600 truncate">
                        {chat.last_message.sender_id === currentUserId ? 'You: ' : ''}
                        {chat.last_message.content}
                    </p>
                )}
                {chat.unread_count > 0 && (
                    <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                            {chat.unread_count}
                        </span>
                    </div>
                )}
            </div>
        </div>
    </button>
));
ChatListItem.displayName = 'ChatListItem';
