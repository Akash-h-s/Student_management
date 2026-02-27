// Types for AI API responses

export interface HighlightStats {
    best_subject: string;
    best_score: string;
    subjects_above_90: number;
    subjects_below_50: number;
}

export interface AISummaryData {
    overall_assessment: string;
    strengths: string[];
    areas_for_improvement: string[];
    suggestions: string[];
    motivational_note: string;
    performance_tier: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
    highlight_stats: HighlightStats;
}

export interface ReviewIssue {
    severity: 'critical' | 'warning' | 'info';
    type: string;
    message: string;
    affected_students: string[];
}

export interface ReviewStatistics {
    class_average: number;
    highest: number;
    lowest: number;
    pass_rate: string;
    total_reviewed: number;
    missing_entries: number;
}

export interface AIReviewData {
    overall_status: 'clean' | 'warnings' | 'critical';
    issues: ReviewIssue[];
    statistics: ReviewStatistics;
    recommendation: string;
}

export interface ClassAnalysisStats {
    mean: number;
    median: number;
    highest: { score: number; student: string };
    lowest: { score: number; student: string };
    pass_rate: string;
    distinction_rate: string;
}

export interface AIClassAnalysisData {
    class_overview: string;
    grade_distribution: Record<string, number>;
    statistics: ClassAnalysisStats;
    top_performers: string[];
    students_needing_attention: string[];
    insights: string[];
    teaching_recommendations: string[];
    overall_rating: 'Excellent' | 'Good' | 'Average' | 'Below Average';
}
