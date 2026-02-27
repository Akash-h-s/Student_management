// src/config/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';


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
  'GetDashboardStats',
];

// Error link - handles unauthorized redirects (session loss/tampering)
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      const code = err.extensions?.code;
      // Handle the access-denied or invalid-jwt codes from Hasura
      if (code === 'access-denied' || code === 'invalid-jwt' || code === 'unauthorized') {
        console.warn('[Apollo Error] Unauthorized - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Force redirect if not on public page
        const path = window.location.pathname.toLowerCase();
        const isPublic = path === '/' || path === '/login' || path === '/signup';
        if (!isPublic) {
          window.location.href = '/login';
        }
      }
    }
  }

  if (networkError && 'statusCode' in networkError) {
    if ((networkError as any).statusCode === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
});

// Auth link - adds JWT token only for protected operations, or anonymous role for public operations
const authLink = setContext((operation, { headers }) => {
  const token = localStorage.getItem('token');
  const operationName = operation.operationName;

  // Check if this is a public operation
  const isPublicOperation = PUBLIC_OPERATIONS.includes(operationName || '');

  return {
    headers: {
      ...headers,
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
  // Chain authLink and errorLink before httpLink
  from([authLink, errorLink, httpLink])
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
          messages: {
            merge(_existing, incoming) {
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