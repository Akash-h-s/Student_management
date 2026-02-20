import { GRADE_COLORS, DEFAULT_GRADE_COLOR, DEFAULT_SCHOOL_NAME } from './constants';
import type { Mark, Student, MarkscardData } from './types';

export const parseParentId = (id: string | number | undefined): number | null => {
    if (!id) return null;
    return typeof id === 'number' ? id : parseInt(id, 10);
};

export const getGradeColor = (grade: string): string => {
    return GRADE_COLORS[grade] || DEFAULT_GRADE_COLOR;
};

export const calculatePercentage = (obtained: number, max: number): string => {
    return ((obtained / max) * 100).toFixed(2);
};

export const groupMarksByExam = (marks: Mark[]): Record<string, Mark[]> => {
    const grouped: Record<string, Mark[]> = {};
    const seenExamIds = new Set<number>();
    const examKeyMapping: Record<number, string> = {};
    const seenSubjectsByExam: Record<number, Set<number>> = {};

    marks.forEach((mark) => {
        const examId = mark.exam.id;

        // Initialize exam tracking if first time seeing this exam
        if (!seenExamIds.has(examId)) {
            seenExamIds.add(examId);
            examKeyMapping[examId] = `${mark.exam.name} (${mark.exam.academic_year})`;
            seenSubjectsByExam[examId] = new Set<number>();
        }

        // Use exam.id + subject.id to prevent duplicate subjects in same exam
        if (!seenSubjectsByExam[examId].has(mark.subject.id)) {
            seenSubjectsByExam[examId].add(mark.subject.id);
            const examKey = examKeyMapping[examId];
            if (!grouped[examKey]) {
                grouped[examKey] = [];
            }
            grouped[examKey].push(mark);
        }
    });

    return grouped;
};

export const calculateTotalMarks = (marks: Mark[]): { total: number; max: number; percentage: string } => {
    const total = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const max = marks.reduce((sum, m) => sum + m.max_marks, 0);
    const percentage = calculatePercentage(total, max);
    return { total, max, percentage };
};

export const prepareMarkscardData = (student: Student, marks: Mark[], examName: string): MarkscardData => {
    const { total, max, percentage } = calculateTotalMarks(marks);

    // Use admin for legacy support, or fallback to defaults
    const schoolAdmin = student.admin;

    return {
        student_name: student.name,
        admission_no: student.admission_no,
        exam_name: examName,
        school_name: schoolAdmin?.school_name || DEFAULT_SCHOOL_NAME,
        school_address: schoolAdmin?.school_address || '',
        school_phone: schoolAdmin?.school_phone || '',
        school_logo_url: schoolAdmin?.school_logo_url || '',
        marks: marks.map((m) => ({
            subject: m.subject.name,
            marks_obtained: m.marks_obtained,
            max_marks: m.max_marks,
            grade: m.grade,
            percentage: calculatePercentage(m.marks_obtained, m.max_marks),
            remarks: m.remarks,
        })),
        total_marks: total,
        max_marks: max,
        overall_percentage: percentage,
        date: new Date().toLocaleDateString(),
    };
};

export const downloadPDF = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const sanitizeFilename = (name: string, examName: string): string => {
    return `${name}_${examName.replace(/[^a-z0-9]/gi, '_')}_Markscard.pdf`;
};
