// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './config/appoloClient';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Apollo Provider - Handles GraphQL */}
    <ApolloProvider client={apolloClient}>
      {/* Router - Handles navigation */}
      <BrowserRouter>
        {/* Auth Provider - Handles authentication */}
        <AuthProvider>
          {/* Your App */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);