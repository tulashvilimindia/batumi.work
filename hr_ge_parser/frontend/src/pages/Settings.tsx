import { Moon, Sun, Server, Database } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

// ============================================================
// COMPONENT
// ============================================================

export function Settings() {
  const { theme, setTheme } = useTheme();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8089';

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application preferences and configuration"
      />

      <div className="space-y-6 max-w-2xl">
        <Card title="Appearance">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </h4>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="API Information">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <Server className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">API Endpoint</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{apiUrl}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data Source</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">hr.ge</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="About">
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              HR.GE Parser Dashboard is an admin interface for managing and monitoring
              job data scraped from HR.GE job portal.
            </p>
            <p>
              The parser runs automatically every 6 hours to keep the job database
              up to date with the latest listings.
            </p>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Version 1.0.0
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
