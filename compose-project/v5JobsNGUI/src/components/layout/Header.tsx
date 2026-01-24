/**
 * Header Component - V5 Enhanced Folk Edition
 * Mobile-first responsive header with all controls integrated
 */

import { Link, useParams, useLocation } from 'react-router-dom';
import { cn } from '@/lib';
import { SUPPORTED_LANGUAGES } from '@/routes';
import { MusicPlayer } from '../music';
import { RecentlyViewedPanel } from '../job';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { lang = 'ge' } = useParams<{ lang: string }>();
  const location = useLocation();

  const getLanguageUrl = (targetLang: string) => {
    // location.pathname doesn't include basename (/v4), just the path like /ge/job/123
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
    return `/${targetLang}${pathWithoutLang}${location.search}`;
  };

  return (
    <header
      className={cn(
        'relative py-3 md:py-4',
        'sticky top-0 z-50',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #4A3728 0%, #3D2914 100%)',
        borderBottom: '3px solid #D4A574',
        boxShadow: '0 4px 20px rgba(61, 41, 20, 0.3)',
      }}
    >
      {/* Decorative top border - simplified for mobile */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'repeating-linear-gradient(90deg, #8B2635 0px, #8B2635 10px, #2D5A3D 10px, #2D5A3D 20px, #D4A574 20px, #D4A574 30px)',
        }}
      />

      {/* Corner decorations - hidden on mobile */}
      <div className="hidden md:block absolute top-1 left-0 w-12 h-12">
        <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#D4A574]" />
        <div className="absolute top-0 left-0 w-[2px] h-8 bg-[#D4A574]" />
        <div className="absolute top-3 left-3 w-1.5 h-1.5 rotate-45 bg-[#8B2635]" />
      </div>
      <div className="hidden md:block absolute top-1 right-0 w-12 h-12">
        <div className="absolute top-0 right-0 w-8 h-[2px] bg-[#D4A574]" />
        <div className="absolute top-0 right-0 w-[2px] h-8 bg-[#D4A574]" />
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rotate-45 bg-[#8B2635]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo - Responsive */}
          <Link
            to={`/${lang}`}
            className="group relative flex items-center gap-2 md:gap-3 shrink-0"
          >
            {/* Logo emblem */}
            <div className="relative">
              <div
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                  border: '2px solid #D4A574',
                  boxShadow: '2px 2px 0 #3D2914, inset 0 0 10px rgba(212, 165, 116, 0.2)',
                }}
              >
                <span
                  className="font-bold text-lg md:text-xl"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    color: '#F5E6D3',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  ა
                </span>
              </div>
              {/* Small decorative diamond */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 rotate-45"
                style={{
                  background: '#2D5A3D',
                  border: '1px solid #D4A574',
                }}
              />
            </div>

            {/* Logo text - hidden on small mobile, shown on larger screens */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="font-bold text-sm md:text-lg tracking-wide"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#F5E6D3',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                <span style={{ color: '#D4A574' }}>აჭარული</span>
                <span className="hidden md:inline mx-1" style={{ color: '#8B6B4B' }}>•</span>
                <span className="hidden md:inline" style={{ color: '#F5E6D3' }}>სამუშაოები</span>
              </span>
              <span
                className="text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.15em] uppercase"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#8B6B4B',
                }}
              >
                Batumi Jobs
              </span>
            </div>
          </Link>

          {/* Right side controls - All in a row */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* V5: Recently Viewed Panel */}
            <RecentlyViewedPanel />

            {/* Music Player */}
            <MusicPlayer compact />

            {/* Telegram button */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2D5A3D, #3D7A5D)',
                border: '2px solid #D4A574',
                boxShadow: '2px 2px 0 #3D2914',
              }}
              aria-label="Subscribe on Telegram"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-[18px] md:h-[18px]" style={{ color: '#F5E6D3' }}>
                <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span
                className="hidden md:inline text-sm font-semibold tracking-wide"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#F5E6D3',
                }}
              >
                {lang === 'ge' ? 'გამოწერა' : 'Subscribe'}
              </span>
            </a>

            {/* Language switcher - Compact on mobile */}
            <div
              className="flex items-center gap-0.5 p-0.5 md:p-1 rounded-lg"
              style={{
                background: 'rgba(61, 41, 20, 0.5)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
              }}
            >
              {SUPPORTED_LANGUAGES.map((supportedLang) => (
                <Link
                  key={supportedLang}
                  to={getLanguageUrl(supportedLang)}
                  className="relative px-2 py-1 md:px-3 md:py-1.5 rounded-md font-semibold text-[10px] md:text-sm tracking-wide uppercase transition-all duration-200"
                  style={{
                    fontFamily: 'Source Sans Pro, sans-serif',
                    ...(lang === supportedLang
                      ? {
                          background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                          color: '#F5E6D3',
                          boxShadow: '1px 1px 0 #3D2914',
                        }
                      : {
                          color: '#8B6B4B',
                        }),
                  }}
                >
                  {supportedLang.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
