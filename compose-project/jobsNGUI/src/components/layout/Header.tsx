import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-secondary py-3',
        'sticky top-0 z-50',
        className
      )}
    >
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-white hover:text-primary transition-colors"
          >
            Batumi<span className="text-primary">.work</span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Language switcher - placeholder for Phase 4 */}
            <div className="flex items-center gap-1 text-sm">
              <button
                className={cn(
                  'px-2 py-1 rounded text-white',
                  'bg-white/20', // Active state for now
                  'hover:bg-white/30 transition-colors'
                )}
              >
                GE
              </button>
              <button
                className={cn(
                  'px-2 py-1 rounded text-white/70',
                  'hover:text-white hover:bg-white/20 transition-colors'
                )}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
