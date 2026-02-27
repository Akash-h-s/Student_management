import React, { useState, useEffect } from 'react';
import type { AISummaryData } from './types';
import AILoadingState from './AILoadingState';

interface AISummaryPanelProps {
    isLoading: boolean;
    summary: AISummaryData | null;
    error: string | null;
    onClose: () => void;
}

const tierConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    Excellent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🏆' },
    Good: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '⭐' },
    Average: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '📊' },
    'Needs Improvement': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '📈' },
};

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ isLoading, summary, error, onClose }) => {
    const [visibleSections, setVisibleSections] = useState(0);

    // Staggered animation effect
    useEffect(() => {
        if (summary) {
            const timer = setInterval(() => {
                setVisibleSections((prev) => {
                    if (prev >= 6) {
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
    }, [summary]);

    if (isLoading) {
        return (
            <div className="mt-4 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
                <AILoadingState
                    message="Generating AI Summary..."
                    subMessage="Analyzing marks and generating personalized insights"
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
                        <h4 className="font-semibold text-red-700">AI Summary Failed</h4>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!summary) return null;

    const tier = tierConfig[summary.performance_tier] || tierConfig.Good;

    return (
        <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">AI Performance Summary</h3>
                        <p className="text-white/70 text-xs">Powered by Google Gemini</p>
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
                {/* Performance Tier Badge */}
                <div
                    className={`transition-all duration-500 ${visibleSections >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${tier.bg} ${tier.text} ${tier.border} font-semibold`}>
                        <span className="text-xl">{tier.icon}</span>
                        <span>{summary.performance_tier}</span>
                    </div>
                </div>

                {/* Overall Assessment */}
                <div
                    className={`transition-all duration-500 ${visibleSections >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <p className="text-gray-700 leading-relaxed text-base">{summary.overall_assessment}</p>
                </div>

                {/* Highlight Stats */}
                {summary.highlight_stats && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Best Subject" value={summary.highlight_stats.best_subject} icon="🎯" color="purple" />
                            <StatCard label="Best Score" value={summary.highlight_stats.best_score} icon="🏅" color="blue" />
                            <StatCard label="Above 90%" value={String(summary.highlight_stats.subjects_above_90)} icon="🔥" color="green" />
                            <StatCard label="Below 50%" value={String(summary.highlight_stats.subjects_below_50)} icon="⚡" color="red" />
                        </div>
                    </div>
                )}

                {/* Strengths */}
                {summary.strengths?.length > 0 && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <SectionHeader title="Strengths" icon="💪" color="green" />
                        <ul className="space-y-2">
                            {summary.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                    <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Areas for Improvement */}
                {summary.areas_for_improvement?.length > 0 && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <SectionHeader title="Areas for Improvement" icon="📝" color="amber" />
                        <ul className="space-y-2">
                            {summary.areas_for_improvement.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Suggestions */}
                {summary.suggestions?.length > 0 && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <SectionHeader title="Suggestions" icon="💡" color="blue" />
                        <div className="space-y-2">
                            {summary.suggestions.map((s, i) => (
                                <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-lg px-4 py-3">
                                    <span className="text-blue-500 font-bold text-sm mt-0.5">{i + 1}.</span>
                                    <span className="text-sm text-blue-800">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Motivational Note */}
                {summary.motivational_note && (
                    <div
                        className={`transition-all duration-500 ${visibleSections >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">✨</span>
                                <p className="text-purple-800 italic leading-relaxed">{summary.motivational_note}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Helper Components ---

function SectionHeader({ title, icon, color }: { title: string; icon: string; color: string }) {
    const colorMap: Record<string, string> = {
        green: 'text-green-700',
        amber: 'text-amber-700',
        blue: 'text-blue-700',
        red: 'text-red-700',
        purple: 'text-purple-700',
    };
    return (
        <h4 className={`font-semibold mb-2 flex items-center gap-2 ${colorMap[color] || 'text-gray-700'}`}>
            <span>{icon}</span>
            {title}
        </h4>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
    const colorMap: Record<string, { bg: string; border: string }> = {
        purple: { bg: 'bg-purple-50', border: 'border-purple-100' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-100' },
        green: { bg: 'bg-emerald-50', border: 'border-emerald-100' },
        red: { bg: 'bg-red-50', border: 'border-red-100' },
    };
    const c = colorMap[color] || colorMap.blue;
    return (
        <div className={`${c.bg} border ${c.border} rounded-lg p-3 text-center`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="font-bold text-gray-800 text-sm truncate">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

export default AISummaryPanel;
