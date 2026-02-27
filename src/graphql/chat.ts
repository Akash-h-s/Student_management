// src/graphql/chat.ts
import { gql } from '@apollo/client';

// Get all chats for a user
export const GET_USER_CHATS = gql`
  query GetUserChats($user_id: Int!, $user_type: String!) {
    chat_participants(
      where: { 
        user_id: { _eq: $user_id }
        user_type: { _eq: $user_type }
      }
    ) {
      chat {
        id
        type
        name
        chat_participants {
          user_id
          user_type
          parent {
            id
            name
            email
          }
          teacher {
            id
            name
            email
          }
        }
        messages(order_by: { created_at: desc }, limit: 1) {
          id
          sender_id
          sender_type
          content
          created_at
          is_read
        }
        messages_aggregate(
          where: { 
            is_read: { _eq: false }
            sender_id: { _neq: $user_id }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

// Get messages for a specific chat
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chat_id: Int!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      sender_id
      sender_type
      content
      created_at
      is_read
    }
  }
`;

// Subscribe to user chats (Real-time)
export const SUBSCRIBE_USER_CHATS = gql`
  subscription SubscribeUserChats($user_id: Int!, $user_type: String!) {
    chat_participants(
      where: { 
        user_id: { _eq: $user_id }
        user_type: { _eq: $user_type }
      }
    ) {
      chat {
        id
        type
        name
        chat_participants {
          user_id
          user_type
          parent {
            id
            name
            email
          }
          teacher {
            id
            name
            email
          }
        }
        messages(order_by: { created_at: desc }, limit: 1) {
          id
          sender_id
          sender_type
          content
          created_at
          is_read
        }
        messages_aggregate(
          where: { 
            is_read: { _eq: false }
            sender_id: { _neq: $user_id }
          }
        ) {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

// Subscribe to chat messages (Real-time)
export const SUBSCRIBE_CHAT_MESSAGES = gql`
  subscription SubscribeChatMessages($chat_id: Int!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      sender_id
      sender_type
      content
      created_at
      is_read
    }
  }
`;

// Search parents
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
      students(limit: 1) {
        name
      }
    }
  }
`;

// Get all parents (for group creation)
export const GET_ALL_PARENTS = gql`
  query GetAllParents {
    parents(order_by: { name: asc }) {
      id
      name
      email
      students(limit: 1) {
        name
      }
    }
  }
`;

// Get teachers (for parent to see)
export const GET_ALL_TEACHERS = gql`
  query GetAllTeachers {
    teachers(where: { is_active: { _eq: true } }, order_by: { name: asc }) {
      id
      name
      email
    }
  }
`;

// Create a new chat
export const CREATE_CHAT = gql`
  mutation CreateChat(
    $type: String!
    $name: String
    $created_by: Int
  ) {
    insert_chats_one(
      object: {
        type: $type
        name: $name
        created_by: $created_by
      }
    ) {
      id
      type
      name
    }
  }
`;

// Add participants to chat
export const ADD_CHAT_PARTICIPANTS = gql`
  mutation AddChatParticipants($participants: [chat_participants_insert_input!]!) {
    insert_chat_participants(objects: $participants) {
      returning {
        chat_id
        user_id
        user_type
      }
    }
  }
`;

// Send a message
export const SEND_MESSAGE = gql`
  mutation SendMessage(
    $chat_id: Int!
    $sender_id: Int!
    $sender_type: String!
    $content: String!
  ) {
    insert_messages_one(
      object: {
        chat_id: $chat_id
        sender_id: $sender_id
        sender_type: $sender_type
        content: $content
      }
    ) {
      id
      sender_id
      sender_type
      content
      created_at
      is_read
    }
  }
`;

// Mark messages as read
export const MARK_MESSAGES_READ = gql`
  mutation MarkMessagesRead($chat_id: Int!, $user_id: Int!) {
    update_messages(
      where: {
        chat_id: { _eq: $chat_id }
        sender_id: { _neq: $user_id }
        is_read: { _eq: false }
      }
      _set: { is_read: true }
    ) {
      affected_rows
    }
  }
`;

// Check if direct chat exists between two users
export const CHECK_EXISTING_CHAT = gql`
  query CheckExistingChat($user1_id: Int!, $user1_type: String!, $user2_id: Int!, $user2_type: String!) {
    chat_participants(
      where: {
        user_id: { _eq: $user1_id }
        user_type: { _eq: $user1_type }
        chat: {
          type: { _eq: "direct" }
          chat_participants: {
            user_id: { _eq: $user2_id }
            user_type: { _eq: $user2_type }
          }
        }
      }
    ) {
      chat {
        id
        type
        name
      }
    }
  }
`;

// Get parent info
export const GET_PARENT_INFO = gql`
  query GetParentInfo($parent_id: Int!) {
    parents_by_pk(id: $parent_id) {
      id
      name
      email
    }
  }
`;

// Get teacher info  
export const GET_TEACHER_INFO = gql`
  query GetTeacherInfo($teacher_id: Int!) {
    teachers_by_pk(id: $teacher_id) {
      id
      name
      email
    }
  }
`;