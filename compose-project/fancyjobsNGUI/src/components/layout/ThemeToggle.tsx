import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores';
import { cn } from '@/lib';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const themeIcons: Record<Theme, React.ReactNode> = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  system: <Monitor size={18} />,
};

const themeLabels: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2 p-2 rounded-md',
        'text-text-inverse hover:text-primary',
        'transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      aria-label={`Current theme: ${themeLabels[theme]}. Click to change theme.`}
      title={`Theme: ${themeLabels[theme]}`}
    >
      <span className="flex items-center justify-center w-5 h-5">
        {themeIcons[theme]}
      </span>
      {showLabel && (
        <span className="text-sm font-medium">{themeLabels[theme]}</span>
      )}
    </button>
  );
}
