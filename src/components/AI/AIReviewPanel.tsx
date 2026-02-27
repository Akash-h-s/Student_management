import React, { useState, useEffect } from 'react';
import type { AIReviewData } from './types';
import AILoadingState from './AILoadingState';

interface AIReviewPanelProps {
    isLoading: boolean;
    review: AIReviewData | null;
    error: string | null;
    onClose: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string; label: string }> = {
    clean: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✅', label: 'All Clear' },
    warnings: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⚠️', label: 'Warnings Found' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🚨', label: 'Critical Issues' },
};

const severityConfig: Record<string, { bg: string; text: string; icon: string }> = {
    critical: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '🔴' },
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '🟡' },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: '🔵' },
};

const AIReviewPanel: React.FC<AIReviewPanelProps> = ({ isLoading, review, error, onClose }) => {
    const [visibleSections, setVisibleSections] = useState(0);

    useEffect(() => {
        if (review) {
            const timer = setInterval(() => {
                setVisibleSections((prev) => {
                    if (prev >= 4) {
                        clearInterval(timer);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 200);
            return () => clearInterval(timer);
        } else {
            setVisibleSections(0);
        }
    }, [review]);

    if (isLoading) {
        return (
            <div className="mt-4 bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                <AILoadingState
                    message="AI Reviewing Marks..."
                    subMessage="Checking for anomalies, errors, and patterns"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                        <h4 className="font-semibold text-red-700">AI Review Failed</h4>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!review) return null;

    const status = statusConfig[review.overall_status] || statusConfig.warnings;

    return (
        <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">AI Marks Review</h3>
                        <p className="text-white/70 text-xs">Pre-submission quality check</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-6 space-y-5">
                {/* Status Badge */}
                <div
                    className={`transition-all duration-500 ${visibleSections >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg} ${status.text} ${status.border} font-semibold`}>
                        <span className="text-xl">{status.icon}</span>
                        <span>{status.label}</span>
                    </div>
                </div>

                {/* Statistics */}
                {review.statistics && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <MiniStat label="Average" value={String(review.statistics.class_average || '-')} />
                            <MiniStat label="Highest" value={String(review.statistics.highest || '-')} />
                            <MiniStat label="Lowest" value={String(review.statistics.lowest || '-')} />
                            <MiniStat label="Pass Rate" value={review.statistics.pass_rate || '-'} />
                            <MiniStat label="Reviewed" value={String(review.statistics.total_reviewed || '-')} />
                            <MiniStat label="Missing" value={String(review.statistics.missing_entries || 0)} highlight={review.statistics.missing_entries > 0} />
                        </div>
                    </div>
                )}

                {/* Issues */}
                {review.issues && review.issues.length > 0 && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>🔍</span> Issues Found ({review.issues.length})
                        </h4>
                        <div className="space-y-3">
                            {review.issues.map((issue, i) => {
                                const sev = severityConfig[issue.severity] || severityConfig.info;
                                return (
                                    <div key={i} className={`border rounded-lg p-4 ${sev.bg}`}>
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg flex-shrink-0">{sev.icon}</span>
                                            <div className="flex-1">
                                                <p className={`font-medium ${sev.text}`}>{issue.message}</p>
                                                {issue.affected_students?.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {issue.affected_students.map((name, j) => (
                                                            <span key={j} className="inline-block bg-white/60 text-xs px-2 py-0.5 rounded-full text-gray-700 border">
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {review.issues?.length === 0 && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                            <p className="text-emerald-700 font-medium">✅ No issues found! Marks look good for submission.</p>
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                {review.recommendation && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <h4 className="font-semibold text-indigo-700 text-sm mb-1">Recommendation</h4>
                                    <p className="text-indigo-800 leading-relaxed text-sm">{review.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

function MiniStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-lg p-3 text-center border ${highlight ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`font-bold text-base ${highlight ? 'text-red-600' : 'text-gray-800'}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

export default AIReviewPanel;
