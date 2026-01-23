import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores';

/**
 * Root App component
 * Sets up routing and initializes theme on mount
 */
function App() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on mount (only run once)
  useEffect(() => {
    // Re-apply theme to ensure it's set correctly on initial load
    setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
