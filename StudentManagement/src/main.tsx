// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient  from './lib/apolloClient';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);