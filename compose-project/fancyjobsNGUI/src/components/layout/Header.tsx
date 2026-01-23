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

  const getLanguageUrl = (targetLang: string) => {
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
    return `/${targetLang}${pathWithoutLang}${location.search}`;
  };

  return (
    <header
      className={cn(
        'relative py-4',
        'bg-surface-solid/80 backdrop-blur-[20px]',
        'border-b border-glass-border',
        'sticky top-0 z-50',
        className
      )}
    >
      {/* Neon glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple opacity-60" />

      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-20 h-[2px] bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
      <div className="absolute top-0 left-0 w-[2px] h-12 bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
      <div className="absolute top-0 right-0 w-20 h-[2px] bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
      <div className="absolute top-0 right-0 w-[2px] h-12 bg-neon-pink" style={{ boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Cyberpunk Logo */}
          <Link
            to={`/${lang}`}
            className="group relative flex items-center gap-3"
          >
            {/* Logo icon */}
            <div className="relative">
              <div
                className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-neon-cyan to-neon-pink"
                style={{
                  borderRadius: '4px 12px 4px 12px',
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)'
                }}
              >
                <span className="font-bold text-xl text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>F</span>
              </div>
            </div>

            {/* Logo text */}
            <div className="flex flex-col leading-tight">
              <span
                className="font-bold text-xl tracking-widest text-white"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                <span className="text-neon-pink" style={{ textShadow: '0 0 10px rgba(255, 0, 110, 0.6)' }}>FANCY</span>
                <span className="text-white/50">.</span>
                <span className="text-neon-cyan" style={{ textShadow: '0 0 10px rgba(0, 245, 255, 0.6)' }}>JOBS</span>
              </span>
              <span
                className="text-[9px] tracking-[0.25em] text-text-tertiary uppercase"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Batumi & Adjara
              </span>
            </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Telegram button - Neon style */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group relative flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-neon-cyan/10 border border-neon-cyan/40',
                'hover:bg-neon-cyan/20 hover:border-neon-cyan',
                'transition-all duration-300'
              )}
              style={{
                boxShadow: '0 0 15px rgba(0, 245, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 245, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.2)';
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" className="text-neon-cyan">
                <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span
                className="hidden sm:inline text-sm font-semibold text-neon-cyan tracking-wider uppercase"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {lang === 'ge' ? 'გამოწერა' : 'Subscribe'}
              </span>
            </a>

            {/* Language switcher - Cyber style */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface/50 border border-white/5">
              {SUPPORTED_LANGUAGES.map((supportedLang) => (
                <Link
                  key={supportedLang}
                  to={getLanguageUrl(supportedLang)}
                  className={cn(
                    'relative px-3 py-1.5 rounded-md font-semibold text-sm tracking-wider uppercase transition-all duration-300',
                    lang === supportedLang
                      ? 'text-white'
                      : 'text-text-secondary hover:text-neon-cyan'
                  )}
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    ...(lang === supportedLang ? {
                      background: 'linear-gradient(135deg, #00F5FF, #FF006E)',
                      boxShadow: '0 0 15px rgba(0, 245, 255, 0.5)'
                    } : {})
                  }}
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
