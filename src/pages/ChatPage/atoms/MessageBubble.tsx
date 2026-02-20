import React from 'react';
import type { Message } from '../types';
import { formatTime } from '../utils';
import { Clock, Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    isParent: boolean;
}

const MessageStatus = ({ status }: { status: Message['status'] }) => {
    switch (status) {
        case 'sending':
            return <Clock className="w-3 h-3 text-gray-400" />;
        case 'sent':
            return <Check className="w-3 h-3 text-gray-400" />;
        case 'read':
            return <CheckCheck className="w-3 h-3 text-blue-500" />;
        case 'error':
            return <span className="text-[10px] text-red-500">Failed</span>;
        default:
            return null;
    }
};

export const MessageBubble = React.memo(({ message, isOwn, isParent }: MessageBubbleProps) => {
    const isTeacherMessage = message.sender_type === 'teacher';

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 ml-3">
                        {message.sender_name}
                        {isTeacherMessage && isParent && ' (Teacher)'}
                    </p>
                )}
                <div className={`px-4 py-2 rounded-2xl ${isOwn ?
                    'bg-indigo-600 text-white rounded-br-sm' :
                    isTeacherMessage && isParent ?
                        'bg-blue-100 text-gray-900 rounded-bl-sm border border-blue-200' :
                        'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'} mx-3 text-gray-400`}>
                    <p className="text-[10px]">
                        {formatTime(message.timestamp)}
                    </p>
                    {isOwn && <MessageStatus status={message.status} />}
                </div>
            </div>
        </div>
    );
});
MessageBubble.displayName = 'MessageBubble';
