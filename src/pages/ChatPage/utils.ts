import { IST_OFFSET_MS, DAY_MS, MONTH_NAMES } from './constants';
import type { Chat, Message, User, UserRole } from './types';

export const parseUserId = (id: string | number | undefined): number => {
    if (typeof id === 'number') return id;
    return parseInt(id || '0', 10);
};

export const getInitials = (name: string): string => name.charAt(0).toUpperCase();

export const convertToIST = (utcTimestamp: string): Date => {
    let timestamp = utcTimestamp;
    if (!timestamp.endsWith('Z') && !timestamp.includes('+')) {
        timestamp += 'Z';
    }
    const utcDate = new Date(timestamp);
    return new Date(utcDate.getTime() + IST_OFFSET_MS);
};

export const formatTime = (timestamp: string): string => {
    const istDate = convertToIST(timestamp);
    const nowIST = new Date(new Date().getTime() + IST_OFFSET_MS);

    const istDateStr = istDate.toISOString().split('T')[0];
    const nowISTStr = nowIST.toISOString().split('T')[0];
    const yesterdayISTStr = new Date(nowIST.getTime() - DAY_MS).toISOString().split('T')[0];

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;

    if (istDateStr === nowISTStr) {
        return timeString;
    }

    if (istDateStr === yesterdayISTStr) {
        return `Yesterday ${timeString}`;
    }

    const day = istDate.getUTCDate();
    const month = MONTH_NAMES[istDate.getUTCMonth()];
    return `${day} ${month}, ${timeString}`;
};

export const transformChatData = (cp: any, currentUserId: number, currentUserName: string): Chat => {
    const chat = cp.chat;

    const allParticipants = chat.chat_participants.map((p: any) => {
        const userInfo = p.user_type === 'parent' ? p.parent : p.teacher;
        return {
            id: p.user_id,
            name: userInfo?.name || 'Unknown',
            email: userInfo?.email || '',
            role: p.user_type,
        };
    });

    const otherParticipants = allParticipants.filter((p: any) => p.id !== currentUserId);

    let chatName = chat.name;
    if (chat.type === 'direct' && otherParticipants.length > 0) {
        chatName = otherParticipants[0].name;
    }

    // Helper for last message
    const lastMsg = chat.messages[0];
    let lastMsgSenderName = 'Unknown';
    if (lastMsg) {
        if (lastMsg.sender_id === currentUserId) {
            lastMsgSenderName = currentUserName;
        } else {
            const sender = allParticipants.find((p: any) => p.id === lastMsg.sender_id && p.role === lastMsg.sender_type);
            lastMsgSenderName = sender?.name || 'Unknown';
        }
    }

    return {
        id: chat.id,
        type: chat.type,
        name: chatName,
        participants: allParticipants,
        last_message: lastMsg ? {
            id: lastMsg.id,
            sender_id: lastMsg.sender_id,
            sender_name: lastMsgSenderName,
            sender_type: lastMsg.sender_type,
            content: lastMsg.content,
            timestamp: lastMsg.created_at,
            is_read: lastMsg.is_read,
            status: lastMsg.is_read ? 'read' : 'sent',
        } : undefined,
        unread_count: chat.messages_aggregate.aggregate.count || 0,
    };
};

export const transformMessageData = (m: any, chatParticipants: User[], currentUserId: number, currentUserName: string): Message => {
    const senderId = parseUserId(m.sender_id);
    let senderName = 'Unknown';

    if (senderId === currentUserId) {
        senderName = currentUserName;
    } else {
        const sender = chatParticipants.find(p => p.id === senderId);
        senderName = sender?.name || 'Unknown';
    }

    return {
        id: parseInt(m.id || '0'),
        sender_id: senderId,
        sender_name: senderName,
        sender_type: m.sender_type,
        content: m.content || '',
        timestamp: m.created_at,
        is_read: !!m.is_read,
        status: m.status || (m.is_read ? 'read' : 'sent'),
    };
};

export const transformUserData = (user: any, role: UserRole): User => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    student_name: user.students?.[0]?.name,
});
