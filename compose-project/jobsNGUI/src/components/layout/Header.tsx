import { Link, useParams, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib';
import { SUPPORTED_LANGUAGES } from '@/routes';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { lang = 'ge' } = useParams<{ lang: string }>();
  const location = useLocation();

  // Build language switch URL preserving current path and search params
  const getLanguageUrl = (targetLang: string) => {
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
    return `/${targetLang}${pathWithoutLang}${location.search}`;
  };

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
            to={`/${lang}`}
            className="text-xl font-bold text-white hover:text-primary transition-colors"
          >
            Batumi<span className="text-primary">.work</span>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Telegram button */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm',
                'bg-[#26A5E4] text-white',
                'hover:bg-[#1e96d1] transition-colors'
              )}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="hidden sm:inline">
                {lang === 'ge' ? 'გამოწერა' : 'Subscribe'}
              </span>
            </a>

            {/* Language switcher */}
            <div className="flex items-center gap-1 text-sm">
              {SUPPORTED_LANGUAGES.map((supportedLang) => (
                <Link
                  key={supportedLang}
                  to={getLanguageUrl(supportedLang)}
                  className={cn(
                    'px-2 py-1 rounded transition-colors',
                    lang === supportedLang
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/20'
                  )}
                >
                  {supportedLang.toUpperCase()}
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
