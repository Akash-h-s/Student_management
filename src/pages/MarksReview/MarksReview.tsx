import React, { useState, useCallback, useMemo } from 'react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAppSelector } from '../../store/hooks';
import {
  GET_STUDENTS_BY_CLASS_SECTION,
  GET_CLASS_MARKS_BY_EXAM,
  INSERT_MARKS,
} from '../../graphql/marks';
import type { Student, Mark, ClassMarksData, FetchStudentsData } from './types';
import { calculateGrade } from './utils';
import { FilterPanel } from './atoms/FilterPanel';
import { StatsPanel } from './atoms/StatsPanel';
import { MarksTable } from './atoms/MarksTable';
import AIReviewPanel from '../../components/AI/AIReviewPanel';
import type { AIReviewData } from '../../components/AI/types';
import { reviewMarksWithAI, getClassAnalysis } from '../../services/aiService';

const MarksReview: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const teacherId = currentUser?.id ? parseInt(currentUser.id.toString()) : null;

  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<Record<number, Partial<Mark>>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // AI Review state
  const [aiReview, setAiReview] = useState<AIReviewData | null>(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState<string | null>(null);
  const [showAiReview, setShowAiReview] = useState(false);
  // Class Analysis state
  const [classAnalysis, setClassAnalysis] = useState<any>(null);
  const [classAnalysisLoading, setClassAnalysisLoading] = useState(false);
  const [classAnalysisError, setClassAnalysisError] = useState<string | null>(null);
  const [showClassAnalysis, setShowClassAnalysis] = useState(false);

  const [fetchStudents, { loading: loadingStudents }] = useLazyQuery<FetchStudentsData>(GET_STUDENTS_BY_CLASS_SECTION, {
    onCompleted: (data) => {
      if (data?.class_sections?.length > 0) {
        const fetchedStudents = data.class_sections[0]?.students || [];
        setStudents(fetchedStudents);
        setErrorMessage('');
      } else {
        setErrorMessage(`No students found for Class ${className}-${sectionName}`);
      }
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to fetch students');
      console.error(error);
    },
  });

  const [getClassMarks, { loading: loadingMarks }] = useLazyQuery<ClassMarksData>(GET_CLASS_MARKS_BY_EXAM, {
    onCompleted: (data) => {
      if (data?.marks) {
        const marks: Record<number, Partial<Mark>> = {};
        data.marks.forEach((mark: Mark) => {
          marks[mark.student_id] = mark;
        });
        setMarksMap(marks);
        setSuccessMessage(`Loaded ${data.marks.length} marks`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to fetch marks');
      console.error(error);
    },
  });

  const [updateMarks, { loading: saving }] = useMutation(INSERT_MARKS, {
    onCompleted: () => {
      setSuccessMessage('✅ Marks updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: ApolloError) => {
      setErrorMessage('Failed to update marks: ' + error.message);
    },
  });

  const handleLoadMarks = () => {
    if (!className || !sectionName || !academicYear || !examName || !subjectName) {
      setErrorMessage('Please fill all fields');
      return;
    }
    fetchStudents({ variables: { className: className.trim(), sectionName: sectionName.trim() } });
    getClassMarks({ variables: { examName: examName.trim(), subjectName: subjectName.trim(), academicYear: academicYear.trim() } });
  };

  const handleCellChange = useCallback((studentId: number, value: string) => {
    const marks = parseFloat(value);
    const grade = !isNaN(marks) ? calculateGrade(marks) : '';
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: marks,
        grade,
      },
    }));
  }, []);

  const handleBulkUpdate = async () => {
    if (!teacherId) return;

    const changedMarks = Object.entries(marksMap)
      .filter(([_, mark]) => mark.marks_obtained !== undefined)
      .map(([studentId, mark]) => ({
        student_id: parseInt(studentId),
        marks_obtained: mark.marks_obtained,
        max_marks: mark.max_marks || 100,
        grade: mark.grade || '',
        remarks: mark.remarks || null,
        teacher_id: teacherId,
        entered_at: new Date().toISOString(),
      }));

    if (changedMarks.length === 0) {
      setErrorMessage('No marks to update');
      return;
    }

    try {
      await updateMarks({ variables: { marks: changedMarks } });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.admission_no.includes(searchTerm)),
    [students, searchTerm]
  );

  const marksStats = useMemo(() => {
    const filled = Object.values(marksMap).filter((m) => m.marks_obtained !== undefined).length;
    const pending = students.length - filled;
    return { filled, pending, total: students.length };
  }, [marksMap, students]);

  const handleAIReview = useCallback(async () => {
    setAiReviewLoading(true);
    setAiReviewError(null);
    setShowAiReview(true);
    try {
      const marksForReview: Record<string, { marks_obtained: number | undefined; max_marks: number; grade: string }> = {};
      Object.entries(marksMap).forEach(([sid, mark]) => {
        marksForReview[sid] = {
          marks_obtained: mark.marks_obtained,
          max_marks: mark.max_marks || 100,
          grade: mark.grade || '',
        };
      });
      const review = await reviewMarksWithAI({
        students: students.map(s => ({ id: s.id, name: s.name, admission_no: s.admission_no })),
        marks: marksForReview,
        subject: subjectName,
        exam: examName,
        academicYear: academicYear,
      });
      setAiReview(review);
    } catch (err: any) {
      setAiReviewError(err.message || 'AI review failed');
    } finally {
      setAiReviewLoading(false);
    }
  }, [students, marksMap, subjectName, examName]);

  const handleClassAnalysis = useCallback(async () => {
    setClassAnalysisLoading(true);
    setClassAnalysisError(null);
    setShowClassAnalysis(true);
    try {
      const marksForAnalysis: Record<string, { marks_obtained: number | undefined; max_marks: number; grade: string }> = {};
      Object.entries(marksMap).forEach(([sid, mark]) => {
        marksForAnalysis[sid] = {
          marks_obtained: mark.marks_obtained,
          max_marks: mark.max_marks || 100,
          grade: mark.grade || '',
        };
      });
      const analysis = await getClassAnalysis({
        students: students.map(s => ({ id: s.id, name: s.name, admission_no: s.admission_no })),
        marks: marksForAnalysis,
        subject: subjectName,
        exam: examName,
        academicYear: academicYear,
        className: className,
        section: sectionName,
      });
      setClassAnalysis(analysis);
    } catch (err: any) {
      setClassAnalysisError(err.message || 'Class analysis failed');
    } finally {
      setClassAnalysisLoading(false);
    }
  }, [students, marksMap, subjectName, examName, className, sectionName]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">📊 Class Marks Review</h1>

        <FilterPanel
          className={className}
          sectionName={sectionName}
          academicYear={academicYear}
          examName={examName}
          subjectName={subjectName}
          onChangeClass={setClassName}
          onChangeSection={setSectionName}
          onChangeAcademicYear={setAcademicYear}
          onChangeExam={setExamName}
          onChangeSubject={setSubjectName}
          onLoadMarks={handleLoadMarks}
          loading={loadingStudents || loadingMarks}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />

        {students.length > 0 && (
          <>
            <StatsPanel stats={marksStats} />

            {/* AI Action Buttons */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAIReview}
                disabled={aiReviewLoading || marksStats.filled === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                {aiReviewLoading ? 'Reviewing...' : '🛡️ AI Review Marks'}
              </button>
              <button
                onClick={handleClassAnalysis}
                disabled={classAnalysisLoading || marksStats.filled === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                {classAnalysisLoading ? 'Analyzing...' : '✨ AI Class Analysis'}
              </button>
            </div>

            {/* AI Review Panel */}
            {showAiReview && (
              <AIReviewPanel
                isLoading={aiReviewLoading}
                review={aiReview}
                error={aiReviewError}
                onClose={() => { setShowAiReview(false); setAiReview(null); setAiReviewError(null); }}
              />
            )}

            {/* Class Analysis Panel */}
            {showClassAnalysis && classAnalysis && !classAnalysisLoading && (
              <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">AI Class Analysis</h3>
                      <p className="text-white/70 text-xs">Powered by Google Gemini</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowClassAnalysis(false); setClassAnalysis(null); }}
                    className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Rating Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${classAnalysis.overall_rating === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    classAnalysis.overall_rating === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      classAnalysis.overall_rating === 'Average' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <span className="text-xl">{classAnalysis.overall_rating === 'Excellent' ? '🏆' : classAnalysis.overall_rating === 'Good' ? '⭐' : '📊'}</span>
                    <span>{classAnalysis.overall_rating}</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{classAnalysis.class_overview}</p>

                  {/* Stats Grid */}
                  {classAnalysis.statistics && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-blue-800">{classAnalysis.statistics.mean}</div>
                        <div className="text-xs text-gray-500">Mean</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-purple-800">{classAnalysis.statistics.median}</div>
                        <div className="text-xs text-gray-500">Median</div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-emerald-800">{classAnalysis.statistics.highest?.score}</div>
                        <div className="text-xs text-gray-500">Highest</div>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-red-800">{classAnalysis.statistics.lowest?.score}</div>
                        <div className="text-xs text-gray-500">Lowest</div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-green-800">{classAnalysis.statistics.pass_rate}</div>
                        <div className="text-xs text-gray-500">Pass Rate</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                        <div className="font-bold text-amber-800">{classAnalysis.statistics.distinction_rate}</div>
                        <div className="text-xs text-gray-500">Distinction</div>
                      </div>
                    </div>
                  )}

                  {/* Top Performers */}
                  {classAnalysis.top_performers?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2"><span>🏅</span> Top Performers</h4>
                      <div className="flex flex-wrap gap-2">
                        {classAnalysis.top_performers.map((p: string, i: number) => (
                          <span key={i} className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Students Needing Attention */}
                  {classAnalysis.students_needing_attention?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2"><span>⚡</span> Needs Attention</h4>
                      <div className="flex flex-wrap gap-2">
                        {classAnalysis.students_needing_attention.map((s: string, i: number) => (
                          <span key={i} className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  {classAnalysis.insights?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><span>💡</span> Key Insights</h4>
                      <ul className="space-y-2">
                        {classAnalysis.insights.map((insight: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Teaching Recommendations */}
                  {classAnalysis.teaching_recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2"><span>📚</span> Teaching Recommendations</h4>
                      <div className="space-y-2">
                        {classAnalysis.teaching_recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 bg-purple-50 rounded-lg px-4 py-3">
                            <span className="text-purple-500 font-bold text-sm mt-0.5">{i + 1}.</span>
                            <span className="text-sm text-purple-800">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showClassAnalysis && classAnalysisLoading && (
              <div className="mt-4 bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden mb-4">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
                    <svg className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Analyzing Class Performance...</h3>
                  <p className="text-sm text-gray-500">AI is crunching the numbers</p>
                </div>
              </div>
            )}

            {showClassAnalysis && classAnalysisError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-red-700">Class Analysis Failed</h4>
                    <p className="text-sm text-red-600">{classAnalysisError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <MarksTable
              students={filteredStudents}
              marksMap={marksMap}
              editingCell={editingCell}
              saving={saving}
              marksStats={marksStats}
              onCellChange={handleCellChange}
              onCellFocus={(id) => setEditingCell(`${id}`)}
              onCellBlur={() => setEditingCell(null)}
              onBulkUpdate={handleBulkUpdate}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MarksReview;
