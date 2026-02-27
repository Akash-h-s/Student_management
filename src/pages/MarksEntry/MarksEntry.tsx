import React from 'react';
import { useMarksEntry } from './hooks/useMarksEntry';
import { MarksControlPanel } from './atoms/MarksControlPanel';
import { MarksTable } from './atoms/MarksTable';

const MarksEntrySystem: React.FC = () => {
  const {
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
    pendingStudentsCount,
    existingMarksMap,
    handlers: {
      handleAddNewSubject,
      handleFetchStudents,
      handleSaveMarks,
      handleMarksChange,
      handleRemarksChange,
    }
  } = useMarksEntry();

  const canSave = students.length > 0 && !!teacherId && Object.values(marksData).some(m => m.marks_obtained !== '');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <MarksControlPanel
          teacherId={teacherId}
          teacherName={teacherName}
          className={className}
          setClassName={setClassName}
          sectionName={sectionName}
          setSectionName={setSectionName}
          subjectName={subjectName}
          setSubjectName={setSubjectName}
          availableSubjects={availableSubjects}
          testType={testType}
          setTestType={setTestType}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          searching={searching}
          duplicateTestWarning={duplicateTestWarning}
          saveStatus={saveStatus}
          errorMessage={errorMessage}
          handleAddNewSubject={handleAddNewSubject}
          handleFetchStudents={handleFetchStudents}
        />

        {students.length > 0 && (
          <MarksTable
            students={students}
            marksData={marksData}
            existingMarksMap={existingMarksMap}
            isEditMode={isEditMode}
            pendingStudentsCount={pendingStudentsCount}
            saving={saving}
            canSave={canSave}
            handleMarksChange={handleMarksChange}
            handleRemarksChange={handleRemarksChange}
            handleSaveMarks={handleSaveMarks}
          />
        )}
      </div>
    </div>
  );
};

export default MarksEntrySystem;
