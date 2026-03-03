// AI Service — API client for AI-powered marks analysis endpoints
import type { AISummaryData, AIReviewData, AIClassAnalysisData } from '../components/AI/types';
import type { MarkscardData } from '../pages/StudentDetails/types';

const API_BASE = 'http://localhost:5000';

/** Parse backend error into a user-friendly message */
function parseAIError(errorMsg: string): string {
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
        return 'AI is temporarily busy (rate limited). The server is retrying automatically — please try again in 30 seconds.';
    }
    if (errorMsg.includes('503') || errorMsg.includes('not available')) {
        return 'AI features are not configured. Please check the GEMINI_API_KEY in the backend .env file.';
    }
    return errorMsg;
}

/**
 * Generate an AI summary for a student's marks card
 */
export const generateAISummary = async (marksData: MarkscardData): Promise<AISummaryData> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/ai/generate-summary`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(marksData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(parseAIError(error.error || 'Failed to generate AI summary'));
    }

    const data = await response.json();
    return data.summary;
};

/**
 * AI review of marks before submission (for teachers)
 */
export const reviewMarksWithAI = async (payload: {
    students: Array<{ id: number; name: string; admission_no: string }>;
    marks: Record<string, { marks_obtained: number | undefined; max_marks: number; grade: string }>;
    subject: string;
    exam: string;
    academicYear?: string;
}): Promise<AIReviewData> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/ai/review-marks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(parseAIError(error.error || 'Failed to review marks'));
    }

    const data = await response.json();
    return data.review;
};

/**
 * AI class-wide performance analysis (for teachers)
 */
export const getClassAnalysis = async (payload: {
    students: Array<{ id: number; name: string; admission_no: string }>;
    marks: Record<string, { marks_obtained: number | undefined; max_marks: number; grade: string }>;
    subject: string;
    exam: string;
    academicYear?: string;
    className: string;
    section: string;
}): Promise<AIClassAnalysisData> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/ai/class-analysis`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(parseAIError(error.error || 'Failed to generate class analysis'));
    }

    const data = await response.json();
    return data.analysis;
};
