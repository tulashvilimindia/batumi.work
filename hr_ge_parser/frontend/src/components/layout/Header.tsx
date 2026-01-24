import { Menu, Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useParserStatus } from '@/hooks/useParser';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/helpers';

// ============================================================
// TYPES
// ============================================================

interface HeaderProps {
  onMenuClick: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { data: parserStatus } = useParserStatus();

  const isParserRunning = parserStatus?.last_run?.status === 'running';

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between h-full px-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 ml-auto">
          {isParserRunning && (
            <Badge variant="warning" className="flex items-center gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', isParserRunning && 'animate-spin')} />
              <span>Parser Running</span>
            </Badge>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
