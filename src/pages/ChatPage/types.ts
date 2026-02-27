export type ViewType = 'chats' | 'new-chat' | 'new-group';
export type UserRole = 'teacher' | 'parent' | 'admin' | 'student'; // Added admin/student for completeness
export type ChatType = 'direct' | 'group';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    student_name?: string;
}

export interface Message {
    id: number;
    sender_id: number;
    sender_name: string;
    sender_type: string;
    content: string;
    timestamp: string;
    is_read: boolean;
    status: 'sending' | 'sent' | 'read' | 'error';
}

export interface Chat {
    id: number;
    type: ChatType;
    name: string;
    participants: User[];
    last_message?: Message;
    unread_count: number;
}
