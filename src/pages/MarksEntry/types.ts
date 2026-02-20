export type SaveStatus = 'idle' | 'success' | 'error';

export interface Student {
    id: number;
    admission_no: string;
    name: string;
}

export interface MarkEntry {
    student_id: number;
    marks_obtained: string;
    grade: string;
    remarks: string;
}

export interface GradeConfig {
    threshold: number;
    grade: string;
    colorClass: string;
}

export interface Subject {
    id: number;
    name: string;
}

export interface FetchStudentsData {
    class_sections: {
        students: Student[];
    }[];
}

export interface InsertMarksData {
    insert_marks: {
        affected_rows: number;
    };
}

export interface SubjectMutationData {
    insert_subjects_one: { id: number };
}

export interface ExamMutationData {
    insert_exams_one: { id: number };
}

export interface FetchSubjectsData {
    subjects: Subject[];
}
