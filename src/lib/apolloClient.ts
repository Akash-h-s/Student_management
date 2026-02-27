import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

// Auth Link: adds JWT token from localStorage to every request
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: 'http://localhost:8085/v1/graphql', // Replace with your Hasura endpoint
  credentials: 'include', // Include cookies if using refresh tokens in httpOnly cookies
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;