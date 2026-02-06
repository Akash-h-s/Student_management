// src/config/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP connection to Hasura
const httpLink = createHttpLink({
  uri: 'http://localhost:8085/v1/graphql',
});

// WebSocket connection for subscriptions (real-time)
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8085/v1/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          ...(token && { authorization: `Bearer ${token}` }),
          ...(!token && { 'x-hasura-role': 'anonymous' }),
        },
      };
    },
  })
);

// List of public operations that don't require JWT (login, signup)
const PUBLIC_OPERATIONS = [
  'Login',
  'Signup',
  'CheckAdminEmail',
  'GetAdminByEmail',
  'GetTeacherByEmail',
  'GetParentByEmail',
  'GetStudentByEmail',
  'InsertAdmin',
];

// Auth link - adds JWT token only for protected operations, or anonymous role for public operations
const authLink = setContext((operation, { headers }) => {
  const token = localStorage.getItem('token');
  const operationName = operation.operationName;
  
  // Check if this is a public operation
  const isPublicOperation = PUBLIC_OPERATIONS.includes(operationName || '');
  
  return {
    headers: {
      ...headers,
      // For public operations, send anonymous role
      ...(isPublicOperation && { 'x-hasura-role': 'anonymous' }),
      // For protected operations, send JWT token
      ...(token && !isPublicOperation && { authorization: `Bearer ${token}` }),
      // For authenticated operations without token, still send user role if available
      ...(!token && !isPublicOperation && { 'x-hasura-role': 'user' }),
    },
  };
});

// Split between HTTP and WebSocket based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          messages: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});