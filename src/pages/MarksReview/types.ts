export interface Student {
    id: number;
    admission_no: string;
    name: string;
}

export interface Mark {
    id: number;
    student_id: number;
    marks_obtained: number;
    max_marks: number;
    grade: string;
    remarks: string | null;
}

export interface ClassMarksData {
    marks: Mark[];
}

export interface FetchStudentsData {
    class_sections: {
        students: Student[];
    }[];
}

export interface GradeThreshold {
    threshold: number;
    grade: string;
    colorClass: string;
}
