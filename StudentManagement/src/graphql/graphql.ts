// src/graphql/queries.ts
import { gql } from '@apollo/client';

// AUTH
export const LOGIN_MUTATION = gql`
  mutation Login($role: String!, $identifier: String!, $password: String, $studentName: String) {
    login(role: $role, identifier: $identifier, password: $password, studentName: $studentName) {
      success
      message
      user {
        id
        name
        email
        role
      }
      token
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($schoolName: String!, $email: String!, $password: String!, $phone: String!) {
    signup(schoolName: $schoolName, email: $email, password: $password, phone: $phone) {
      success
      message
      user {
        id
        name
        email
        role
      }
      token
    }
  }
`;

// STUDENTS
export const GET_STUDENTS_BY_CLASS = gql`
  query GetStudentsByClass($class_name: String!, $section_name: String!) {
    students(
      where: {
        class: { _eq: $class_name }
        section: { _eq: $section_name }
      }
      order_by: { name: asc }
    ) {
      id
      admission_no
      name
      class
      section
    }
  }
`;

// MARKS
export const INSERT_MARKS = gql`
  mutation InsertMarks($marks: [marks_insert_input!]!) {
    insert_marks(objects: $marks) {
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

// CHAT - Get Chats
export const GET_CHATS = gql`
  query GetChats($user_id: Int!) {
    chats(
      where: {
        chat_participants: {
          user_id: { _eq: $user_id }
        }
      }
      order_by: { updated_at: desc }
    ) {
      id
      type
      name
      chat_participants {
        user_id
        user_type
      }
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        content
        created_at
        sender_id
        sender_type
      }
    }
  }
`;

// CHAT - Get Messages (Subscription for real-time)
export const MESSAGES_SUBSCRIPTION = gql`
  subscription GetMessages($chat_id: Int!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      content
      created_at
      sender_id
      sender_type
      chat_id
    }
  }
`;

// CHAT - Send Message
export const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: Int!, $sender_id: Int!, $sender_type: String!, $content: String!) {
    insert_messages_one(
      object: {
        chat_id: $chat_id
        sender_id: $sender_id
        sender_type: $sender_type
        content: $content
      }
    ) {
      id
      content
      created_at
      sender_id
      sender_type
    }
    update_chats_by_pk(
      pk_columns: { id: $chat_id }
      _set: { updated_at: "now()" }
    ) {
      id
    }
  }
`;

// CHAT - Create Chat
export const CREATE_CHAT = gql`
  mutation CreateChat($type: String!, $participants: [chat_participants_insert_input!]!, $name: String) {
    insert_chats_one(
      object: {
        type: $type
        name: $name
        chat_participants: {
          data: $participants
        }
      }
    ) {
      id
      type
      name
      chat_participants {
        user_id
        user_type
      }
    }
  }
`;

// CHAT - Search Parents
export const SEARCH_PARENTS = gql`
  query SearchParents($search: String!) {
    parents(
      where: {
        _or: [
          { name: { _ilike: $search } }
          { email: { _ilike: $search } }
        ]
      }
      order_by: { name: asc }
    ) {
      id
      name
      email
      students {
        name
      }
    }
  }
`;

// Get All Parents
export const GET_ALL_PARENTS = gql`
  query GetAllParents {
    parents(order_by: { name: asc }) {
      id
      name
      email
      students {
        name
      }
    }
  }
`;