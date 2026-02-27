import React, {useCallback } from 'react';
import type{FC} from 'react'
import { Send } from 'lucide-react';
import { PLACEHOLDERS, EMPTY_STATES } from '../constants';
import { EmptyState } from './EmptyState';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import type { Chat, Message } from '../types';

interface ChatMainAreaProps {
    selectedChat: Chat | null;
    isTeacher: boolean;
    isParent: boolean;
    messages: Message[];
    currentUserId: number;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    messageInput: string;
    setMessageInput: (input: string) => void;
    sendMessage: () => void;
    setSelectedChat: (chat: Chat | null) => void;
}

export const ChatMainArea: FC<ChatMainAreaProps> = ({
    selectedChat,
    isTeacher,
    isParent,
    messages,
    currentUserId,
    messagesEndRef,
    messageInput,
    setMessageInput,
    sendMessage,
    setSelectedChat
}) => {
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    return (
        <div className={`flex-1 flex flex-col h-full bg-white ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {!selectedChat ? (
                <EmptyState {...EMPTY_STATES.NO_CHAT_SELECTED} />
            ) : (
                <>
                    <ChatHeader
                        chat={selectedChat}
                        isTeacher={isTeacher}
                        onBack={() => setSelectedChat(null)}
                    />

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col gap-4">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={message.sender_id === currentUserId}
                                isParent={isParent}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="max-w-4xl mx-auto flex gap-3">
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={PLACEHOLDERS.MESSAGE_INPUT}
                                className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!messageInput.trim()}
                                className={`p-2.5 rounded-full transition-colors ${messageInput.trim()
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
