export interface StudentDoc {
    id: string;
    admission_no: string;
    name: string;
    class_name?: string;
    section_name?: string;
    parent_id: string;
    created_by_admin_id: string;
    is_active: boolean;
    updated_at: string;
    marks?: Array<{
        id: number;
        marks_obtained: number;
        max_marks: number;
        grade: string;
        remarks: string;
        subject: {
            id: number;
            name: string;
        };
        exam: {
            id: number;
            name: string;
            academic_year: string;
        };
        entered_at: string;
    }>;
}

export interface TeacherDoc {
    id: string;
    name: string;
    email: string;
    school_id: string;
    is_active: boolean;
    slug: string;
}

export interface ChatDoc {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    last_message_at?: string;
    created_by?: string;
    participants?: Array<{
        id: number;
        name: string;
        role: string;
        email?: string;
    }>;
}

export interface MessageDoc {
    id: string;
    chat_id: string;
    sender_id: string;
    sender_name?: string;
    sender_type: string;
    content: string;
    created_at: string;
    is_read: boolean;
    status: 'sending' | 'sent' | 'read' | 'error';
}

export interface DashboardStatsDoc {
    id: string; // 'singleton'
    students_count: number;
    teachers_count: number;
    admins_count: number;
    parents_count: number;
    updated_at: string;
}
