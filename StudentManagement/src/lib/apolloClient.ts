
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'http://localhost:8085/v1/graphql', // Replace with your Hasura endpoint
  headers: {
    'x-hasura-admin-secret': 'myadminsecretkey', // Replace with your admin secret
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;