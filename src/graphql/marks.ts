
// Query to fetch all subjects for a class
export const GET_ALL_SUBJECTS = gql`
  query GetAllSubjects($className: String!) {
    subjects(
      where: { class_name: { _eq: $className } }
      order_by: { name: asc }
      distinct_on: [name]
    ) {
      id
      name
    }
  }
`;
// src/graphql/marks.ts
import { gql } from '@apollo/client';

// Query to fetch students by class and section
export const GET_STUDENTS_BY_CLASS_SECTION = gql`
  query GetStudentsByClassSection($className: String!, $sectionName: String!) {
    class_sections(
      where: {
        class_name: { _eq: $className }
        section_name: { _eq: $sectionName }
      }
    ) {
      id
      students(where: { is_active: { _eq: true } }) {
        id
        admission_no
        name
      }
    }
  }
`;

// Mutation to insert marks (bulk insert with on_conflict for upsert)
export const INSERT_MARKS = gql`
  mutation InsertMarks($marks: [marks_insert_input!]!) {
    insert_marks(
      objects: $marks
      on_conflict: {
        constraint: marks_student_subject_exam_key
        update_columns: [marks_obtained, grade, remarks, max_marks, teacher_id, entered_at]
      }
    ) {
      affected_rows
      returning {
        id
        student_id
        marks_obtained
        grade
      }
    }
  }
`;
export const GET_ALL_EXAMS = gql`
  query GetAllExams {
    exams(order_by: { name: asc }) {
      id
      name
      academic_year
    }
  }
`;

// Query to check if exam exists
export const CHECK_EXAM_EXISTS = gql`
  query CheckExamExists($name: String!, $academicYear: String!) {
    exams(where: { name: { _eq: $name }, academic_year: { _eq: $academicYear } }) {
      id
      name
      academic_year
    }
  }
`;

// Query to check existing marks for students by subject and exam
export const CHECK_EXISTING_MARKS = gql`
  query CheckExistingMarks($subjectId: Int!, $examId: Int!, $studentIds: [Int!]!) {
    marks(
      where: {
        subject_id: { _eq: $subjectId }
        exam_id: { _eq: $examId }
        student_id: { _in: $studentIds }
      }
    ) {
      id
      student_id
      marks_obtained
      max_marks
      grade
      remarks
    }
  }
`;

// Query to fetch all class marks for an exam and subject
export const GET_CLASS_MARKS_BY_EXAM = gql`
  query GetClassMarksByExam($examName: String!, $subjectName: String!, $academicYear: String!) {
    marks(
      where: {
        exam: { 
          name: { _eq: $examName },
          academic_year: { _eq: $academicYear }
        }
        subject: { name: { _eq: $subjectName } }
      }
      order_by: { student_id: asc }
    ) {
      id
      student_id
      marks_obtained
      max_marks
      grade
      remarks
    }
  }
`;

// Query to get or create subject
export const GET_OR_CREATE_SUBJECT = gql`
  mutation GetOrCreateSubject($name: String!, $className: String!, $teacherId: Int!) {
    insert_subjects_one(
      object: {
        name: $name
        class_name: $className
        teacher_id: $teacherId
      }
      on_conflict: {
        constraint: subjects_name_class_name_key
        update_columns: [teacher_id]
      }
    ) {
      id
      name
    }
  }
`;

// Query to get or create exam
export const GET_OR_CREATE_EXAM = gql`
  mutation GetOrCreateExam($name: String!, $academicYear: String!) {
    insert_exams_one(
      object: {
        name: $name
        academic_year: $academicYear
      }
      on_conflict: {
        constraint: exams_name_academic_year_key
        update_columns: [name]
      }
    ) {
      id
      name
    }
  }
`;






// Mutation to get or create subject (returns existing or creates new)
export const UPSERT_SUBJECT = gql`
  mutation UpsertSubject($name: String!, $className: String!, $teacherId: Int!) {
    insert_subjects_one(
      object: {
        name: $name
        class_name: $className
        teacher_id: $teacherId
      }
      on_conflict: {
        constraint: subjects_name_class_name_key
        update_columns: [teacher_id]
      }
    ) {
      id
      name
    }
  }
`;

// Mutation to get or create exam
export const UPSERT_EXAM = gql`
  mutation UpsertExam($name: String!, $academicYear: String!) {
    insert_exams_one(
      object: {
        name: $name
        academic_year: $academicYear
      }
      on_conflict: {
        constraint: exams_name_academic_year_key
        update_columns: [name]
      }
    ) {
      id
      name
      academic_year
    }
  }
`;

// Mutation to insert/update marks (bulk upsert)
export const UPSERT_MARKS = gql`
  mutation UpsertMarks($marks: [marks_insert_input!]!) {
    insert_marks(
      objects: $marks
      on_conflict: {
        constraint: marks_student_subject_exam_key
        update_columns: [marks_obtained, grade, remarks, max_marks, teacher_id, entered_at]
      }
    ) {
      affected_rows
      returning {
        id
        student_id
        marks_obtained
        grade
      }
    }
  }
`;