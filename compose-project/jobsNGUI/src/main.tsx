import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import i18n configuration (must be imported before App)
import './i18n/config';

// Import global styles
import './index.css';

// Register service worker for PWA
import { registerSW } from './registerSW';

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
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
