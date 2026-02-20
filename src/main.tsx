// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './config/apolloClient';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import { RxDBProvider } from './db/RxDBContext';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

// Register Service Worker for PWA
registerSW({
  immediate: true,
  onRegistered(r) {
    console.log('[PWA] Service Worker registered successfully', r);
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration failed', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Apollo Provider - Handles GraphQL */}
    <ApolloProvider client={apolloClient}>
      <Provider store={store}>
        {/* Auth Provider - Bridges Redux to Context for legacy compatibility */}
        <AuthProvider>
          <RxDBProvider>
            {/* Router - Handles navigation */}
            <BrowserRouter>
              {/* Your App */}
              <App />
            </BrowserRouter>
          </RxDBProvider>
        </AuthProvider>
      </Provider>
    </ApolloProvider>
  </React.StrictMode>
);