import type{ FC } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { SubjectSelectWithNew } from './SubjectSelectWithNew';
import { AlertBox } from './AlertBox';
import { PLACEHOLDERS, BUTTON_STYLES, TEST_TYPES, ERROR_MESSAGES } from '../constants';
import type { Subject, SaveStatus } from '../types';

interface MarksControlPanelProps {
    teacherId: number | null;
    teacherName?: string;
    className: string;
    setClassName: (val: string) => void;
    sectionName: string;
    setSectionName: (val: string) => void;
    subjectName: string;
    setSubjectName: (val: string) => void;
    availableSubjects: Subject[];
    testType: string;
    setTestType: (val: string) => void;
    academicYear: string;
    setAcademicYear: (val: string) => void;
    searching: boolean;
    duplicateTestWarning: string;
    saveStatus: SaveStatus;
    errorMessage: string;

    handleAddNewSubject: (name: string) => void;
    handleFetchStudents: () => void;
}

export const MarksControlPanel: FC<MarksControlPanelProps> = ({
    teacherId,
    teacherName,
    className,
    setClassName,
    sectionName,
    setSectionName,
    subjectName,
    setSubjectName,
    availableSubjects,
    testType,
    setTestType,
    academicYear,
    setAcademicYear,
    searching,
    duplicateTestWarning,
    saveStatus,
    errorMessage,
    handleAddNewSubject,
    handleFetchStudents
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Marks Entry System</h1>

            {teacherId ? (
                <AlertBox type="info"><span className="font-semibold">Logged in:</span> {teacherName}</AlertBox>
            ) : (
                <AlertBox type="error" icon={<AlertCircle className="w-5 h-5" />}>{ERROR_MESSAGES.NOT_AUTHENTICATED}</AlertBox>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <FormInput label="Class" value={className} onChange={setClassName} placeholder={PLACEHOLDERS.CLASS} required />
                <FormInput label="Section" value={sectionName} onChange={setSectionName} placeholder={PLACEHOLDERS.SECTION} required />
                <SubjectSelectWithNew
                    label="Subject"
                    value={subjectName}
                    onChange={setSubjectName}
                    subjects={availableSubjects}
                    onAddNew={handleAddNewSubject}
                    required
                />
                <FormSelect label="Test Type" value={testType} onChange={setTestType} options={TEST_TYPES} required />
                <FormInput label="Academic Year" value={academicYear} onChange={setAcademicYear} placeholder={PLACEHOLDERS.ACADEMIC_YEAR} />

                <div className="flex items-end">
                    <button onClick={handleFetchStudents} disabled={searching} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${searching ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary}`}>
                        <Search className="w-5 h-5" /> {searching ? 'Fetching...' : 'Fetch Students'}
                    </button>
                </div>
            </div>

            {duplicateTestWarning && <AlertBox type="warning">{duplicateTestWarning}</AlertBox>}

            {saveStatus === 'success' && errorMessage ? (
                <AlertBox type="success">{errorMessage}</AlertBox>
            ) : saveStatus === 'error' && errorMessage ? (
                <AlertBox type="error">{errorMessage}</AlertBox>
            ) : errorMessage && saveStatus === 'idle' ? (
                <AlertBox type={errorMessage.includes('✏️') || errorMessage.includes('✅') ? 'info' : 'error'}>{errorMessage}</AlertBox>
            ) : null}
        </div>
    );
};
