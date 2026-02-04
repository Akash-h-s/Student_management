// src/config/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
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
    connectionParams: {
      headers: {
        'x-hasura-admin-secret': 'myadminsecretkey',
      },
    },
  })
);

// Auth link - adds token to every request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': 'myadminsecretkey',
      ...(token && { authorization: `Bearer ${token}` }),
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