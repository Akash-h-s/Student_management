export interface Admin {
    id: number;
    name: string;
    email: string;
    school_name?: string;
    school_address?: string;
    school_phone?: string;
    school_logo_url?: string;
}

export interface Exam {
    id: number;
    name: string;
    academic_year: string;
}

export interface Subject {
    id: number;
    name: string;
}

export interface Mark {
    id: number;
    subject: Subject;
    exam: Exam;
    marks_obtained: number;
    max_marks: number;
    grade: string;
    remarks: string | null;
    entered_at: string;
}

export interface Student {
    id: number;
    name: string;
    admission_no: string;
    marks: Mark[];
    admin?: Admin;
    creator_admin?: Admin;
    created_by_admin_id?: number;
}

export interface MarkscardData {
    student_name: string;
    admission_no: string;
    exam_name: string;
    school_name: string;
    school_address: string;
    school_phone: string;
    school_logo_url: string;
    marks: Array<{
        subject: string;
        marks_obtained: number;
        max_marks: number;
        grade: string;
        percentage: string;
        remarks: string | null;
    }>;
    total_marks: number;
    max_marks: number;
    overall_percentage: string;
    date: string;
}
