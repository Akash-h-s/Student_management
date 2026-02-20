import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLazyQuery, useMutation, ApolloError } from '@apollo/client';
import { useAppSelector } from '../../../store/hooks';
import {
    GET_STUDENTS_BY_CLASS_SECTION,
    INSERT_MARKS,
    GET_OR_CREATE_SUBJECT,
    GET_OR_CREATE_EXAM,
    CHECK_EXAM_EXISTS,
    CHECK_EXISTING_MARKS,
    GET_ALL_SUBJECTS,
} from '../../../graphql/marks';
import type { Student, MarkEntry, SaveStatus, Subject, FetchStudentsData, SubjectMutationData, ExamMutationData, FetchSubjectsData, InsertMarksData } from '../types';
import {
    MAX_MARKS,
    ERROR_MESSAGES,
} from '../constants';
import {
    parseTeacherId,
    getCurrentYear,
    calculateGrade,
    initializeMarksData
} from '../utils';

export const useMarksEntry = () => {
    const currentUser = useAppSelector((state) => state.auth.user);

    const teacherId = useMemo(() => parseTeacherId(currentUser?.id), [currentUser?.id]);
    const teacherName = currentUser?.name;

    const [className, setClassName] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [testType, setTestType] = useState('');
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [marksData, setMarksData] = useState<Record<number, MarkEntry>>({});
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [duplicateTestWarning, setDuplicateTestWarning] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingMarksMap, setExistingMarksMap] = useState<Record<number, any>>({});
    const [savedStudentIds, setSavedStudentIds] = useState<Set<number>>(new Set());
    const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
    const [currentExamId, setCurrentExamId] = useState<number | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

    const [createSubject] = useMutation<SubjectMutationData>(GET_OR_CREATE_SUBJECT);
    const [createExam] = useMutation<ExamMutationData>(GET_OR_CREATE_EXAM);

    const [getSubjects] = useLazyQuery<FetchSubjectsData>(GET_ALL_SUBJECTS, {
        onCompleted: useCallback((data: FetchSubjectsData) => {
            setAvailableSubjects(data?.subjects || []);
        }, []),
        onError: useCallback(() => {
            setAvailableSubjects([]);
        }, []),
    });

    const [checkExam] = useLazyQuery(CHECK_EXAM_EXISTS, {
        onCompleted: useCallback((data: any) => {
            if (data?.exams?.length > 0) {
                setDuplicateTestWarning(`⚠️ "${testType}" already exists for ${academicYear || getCurrentYear()}. Update marks for existing test or select a different test type.`);
            } else {
                setDuplicateTestWarning('');
            }
        }, [testType, academicYear]),
        onError: useCallback(() => {
            setDuplicateTestWarning('');
        }, []),
    });

    const [checkExistingMarks] = useLazyQuery(CHECK_EXISTING_MARKS, {
        onCompleted: useCallback((data: any) => {
            if (data?.marks?.length > 0) {
                const existingMap: Record<number, any> = {};
                const updatedMarksData: Record<number, MarkEntry> = { ...marksData };

                data.marks.forEach((mark: any) => {
                    existingMap[mark.student_id] = mark;
                    updatedMarksData[mark.student_id] = {
                        student_id: mark.student_id,
                        marks_obtained: mark.marks_obtained.toString(),
                        grade: mark.grade,
                        remarks: mark.remarks || '',
                    };
                });

                setExistingMarksMap(existingMap);
                setMarksData(updatedMarksData);
                setIsEditMode(true);
                setErrorMessage(`✏️ Found existing marks for ${data.marks.length} student(s). You can now update them.`);
            } else {
                setIsEditMode(false);
                setExistingMarksMap({});
            }
        }, [marksData]),
        onError: useCallback(() => {
            setIsEditMode(false);
            setExistingMarksMap({});
        }, []),
    });

    const [fetchStudents, { loading: searching }] = useLazyQuery<FetchStudentsData>(GET_STUDENTS_BY_CLASS_SECTION, {
        onCompleted: useCallback((data: FetchStudentsData) => {
            if (data?.class_sections?.length > 0) {
                const fetchedStudents = data.class_sections[0]?.students || [];
                if (fetchedStudents.length === 0) {
                    setErrorMessage(`No students found for Class ${className}-${sectionName}`);
                    setStudents([]);
                    return;
                }
                setStudents(fetchedStudents);
                setMarksData(initializeMarksData(fetchedStudents));
                setErrorMessage('');
            } else {
                setErrorMessage(`No class found: ${className}-${sectionName}`);
                setStudents([]);
            }
        }, [className, sectionName]),
        onError: useCallback((error: ApolloError) => {
            setErrorMessage(ERROR_MESSAGES.FETCH_FAILED);
            console.error(error);
        }, []),
    });

    const [insertMarks, { loading: saving }] = useMutation<InsertMarksData>(INSERT_MARKS, {
        onCompleted: useCallback((data: InsertMarksData) => {
            if (data?.insert_marks?.affected_rows > 0) {
                setSaveStatus('success');
                const message = isEditMode
                    ? `✅ ${data.insert_marks.affected_rows} mark(s) updated successfully!`
                    : `✅ Marks saved successfully!`;
                setErrorMessage(message);

                const newSavedIds = new Set(savedStudentIds);
                Object.keys(marksData).forEach(key => {
                    const studentId = parseInt(key);
                    if (marksData[studentId]?.marks_obtained) {
                        newSavedIds.add(studentId);
                    }
                });
                setSavedStudentIds(newSavedIds);

                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }, [isEditMode, marksData, savedStudentIds]),
        onError: useCallback((error: ApolloError) => {
            setSaveStatus('error');
            setErrorMessage(ERROR_MESSAGES.SAVE_FAILED + error.message);
        }, []),
    });

    // Effects
    useEffect(() => {
        if (className) {
            getSubjects({ variables: { className: className.trim() } });
        } else {
            setAvailableSubjects([]);
        }
    }, [className, getSubjects]);

    useEffect(() => {
        if (testType) {
            setExamName(testType);
            checkExam({ variables: { name: testType, academicYear: academicYear || getCurrentYear() } });
        } else {
            setExamName(''); // Should we clear exam name? Original code didn't clear explicitly but useEffect dependency [testType] triggers setExamName(testType). If testType is empty, examName becomes empty.
            setDuplicateTestWarning('');
        }
    }, [testType, academicYear, checkExam]);

    useEffect(() => {
        if (students.length > 0 && currentSubjectId && currentExamId) {
            checkExistingMarks({
                variables: {
                    subjectId: currentSubjectId,
                    examId: currentExamId,
                    studentIds: students.map(s => s.id)
                }
            });
        }
    }, [students, currentSubjectId, currentExamId, checkExistingMarks]);

    // Handlers
    const handleMarksChange = useCallback((studentId: number, marks: string) => {
        const numMarks = parseFloat(marks);
        const grade = marks && !isNaN(numMarks) ? calculateGrade(numMarks) : '';
        setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], marks_obtained: marks, grade } }));
    }, []);

    const handleRemarksChange = useCallback((studentId: number, remarks: string) => {
        setMarksData((prev) => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
    }, []);

    const handleAddNewSubject = async (newSubjectName: string) => {
        if (!teacherId || !className) return;
        try {
            const result = await createSubject({
                variables: {
                    name: newSubjectName.trim().toLowerCase(),
                    className: className.trim(),
                    teacherId
                }
            });
            if (result.data?.insert_subjects_one?.id) {
                setSubjectName(newSubjectName.trim().toLowerCase());
                getSubjects({ variables: { className: className.trim() } });
                setErrorMessage(`✅ Subject "${newSubjectName}" created successfully!`);
            }
        } catch (err) {
            const error = err as Error;
            setErrorMessage('Failed to create subject: ' + error.message);
        }
    };

    const handleFetchStudents = async () => {
        if (!teacherId || !className || !sectionName) return setErrorMessage(ERROR_MESSAGES.CLASS_SECTION_REQUIRED);
        if (!subjectName || !examName) return setErrorMessage(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);

        try {
            const subRes = await createSubject({ variables: { name: subjectName.trim().toLowerCase(), className: className.trim(), teacherId } });
            const exRes = await createExam({ variables: { name: examName.trim(), academicYear: academicYear.trim() || getCurrentYear() } });

            const subjectId = subRes.data?.insert_subjects_one.id;
            const examId = exRes.data?.insert_exams_one.id;

            if (subjectId && examId) {
                setCurrentSubjectId(subjectId);
                setCurrentExamId(examId);
            }

            fetchStudents({ variables: { className: className.trim(), sectionName: sectionName.trim() } });
        } catch (err) {
            const error = err as Error;
            setErrorMessage('Error loading subject/exam: ' + error.message);
        }
    };

    const handleSaveMarks = async () => {
        if (!teacherId || !className || !sectionName || !subjectName || !examName) return setErrorMessage(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
        const marksToSave = Object.values(marksData).filter((m) => m.marks_obtained !== '');
        if (marksToSave.length === 0) return setErrorMessage(ERROR_MESSAGES.NO_MARKS_ENTERED);

        try {
            const subRes = await createSubject({ variables: { name: subjectName.trim().toLowerCase(), className: className.trim(), teacherId } });
            const exRes = await createExam({ variables: { name: examName.trim(), academicYear: academicYear.trim() || getCurrentYear() } });

            const subjectId = subRes.data?.insert_subjects_one.id;
            const examId = exRes.data?.insert_exams_one.id;

            if (subjectId && examId) {
                const entries = marksToSave.map((m) => ({
                    student_id: m.student_id,
                    subject_id: subjectId,
                    exam_id: examId,
                    teacher_id: teacherId,
                    marks_obtained: parseFloat(m.marks_obtained),
                    max_marks: MAX_MARKS,
                    grade: m.grade,
                    remarks: m.remarks || null,
                    entered_at: new Date().toISOString(),
                }));
                await insertMarks({ variables: { marks: entries } });
            }
        } catch (err) {
            const error = err as Error;
            setErrorMessage(ERROR_MESSAGES.SAVE_FAILED + error.message);
            setSaveStatus('error');
        }
    };

    return {
        teacherId,
        teacherName,
        className,
        setClassName,
        sectionName,
        setSectionName,
        subjectName,
        setSubjectName,
        testType,
        setTestType,
        academicYear,
        setAcademicYear,
        students,
        marksData,
        saveStatus,
        errorMessage,
        duplicateTestWarning,
        availableSubjects,
        searching,
        saving,
        isEditMode,
        pendingStudentsCount: students.filter(s => !marksData[s.id]?.marks_obtained).length,
        existingMarksMap, // Needed for isEditing prop in row
        handlers: {
            handleAddNewSubject,
            handleFetchStudents,
            handleSaveMarks,
            handleMarksChange,
            handleRemarksChange,
        }
    };
};
