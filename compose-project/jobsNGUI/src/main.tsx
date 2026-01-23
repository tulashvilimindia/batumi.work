import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './api/queryClient';

// Import i18n configuration (must be imported before App)
import './i18n/config';

// Import global styles
import './index.css';

// Register service worker for PWA
import { registerSW } from './registerSW';

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Register service worker in production
if (import.meta.env.PROD) {
  registerSW({
    onReady: () => {
      console.log('App is ready to work offline');
    },
    onUpdate: () => {
      console.log('New version available! Refresh to update.');
    },
    onOffline: () => {
      console.log('App is running in offline mode');
    },
  });
}
