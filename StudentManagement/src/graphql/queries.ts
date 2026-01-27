import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const SEARCH_PARENTS = gql`
  query SearchParents($searchTerm: String!) {
    searchParents(searchTerm: $searchTerm) {
      id
      name
      email
    }
  }
`;

export const GET_ALL_PARENTS = gql`
  query GetAllParents {
    getAllParents {
      id
      name
      email
    }
  }
`;

export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      participants {
        id
        name
        email
      }
      lastMessage {
        content
        createdAt
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      sender {
        id
        name
      }
      createdAt
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($participantId: ID!) {
    createChat(participantId: $participantId) {
      id
      participants {
        id
        name
        email
      }
    }
  }
`;

export const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageReceived($chatId: ID!) {
    messageReceived(chatId: $chatId) {
      id
      content
      sender {
        id
        name
      }
      createdAt
    }
  }
`;