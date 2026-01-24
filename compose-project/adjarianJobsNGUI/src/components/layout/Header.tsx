/**
 * Header Component - Adjarian Folk Edition
 * Warm, welcoming header with traditional styling
 */

import { Link, useParams, useLocation } from 'react-router-dom';
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
        'sticky top-0 z-50',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #4A3728 0%, #3D2914 100%)',
        borderBottom: '3px solid #D4A574',
        boxShadow: '0 4px 20px rgba(61, 41, 20, 0.3)',
      }}
    >
      {/* Decorative top border with traditional pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'repeating-linear-gradient(90deg, #8B2635 0px, #8B2635 10px, #2D5A3D 10px, #2D5A3D 20px, #D4A574 20px, #D4A574 30px)',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-1 left-0 w-16 h-16">
        <div className="absolute top-0 left-0 w-12 h-[2px] bg-[#D4A574]" />
        <div className="absolute top-0 left-0 w-[2px] h-12 bg-[#D4A574]" />
        <div className="absolute top-4 left-4 w-2 h-2 rotate-45 bg-[#8B2635]" />
      </div>
      <div className="absolute top-1 right-0 w-16 h-16">
        <div className="absolute top-0 right-0 w-12 h-[2px] bg-[#D4A574]" />
        <div className="absolute top-0 right-0 w-[2px] h-12 bg-[#D4A574]" />
        <div className="absolute top-4 right-4 w-2 h-2 rotate-45 bg-[#8B2635]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Adjarian Folk Logo */}
          <Link
            to={`/${lang}`}
            className="group relative flex items-center gap-3"
          >
            {/* Logo emblem - traditional style */}
            <div className="relative">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                  border: '2px solid #D4A574',
                  boxShadow: '3px 3px 0 #3D2914, inset 0 0 10px rgba(212, 165, 116, 0.2)',
                }}
              >
                {/* Georgian-style letter */}
                <span
                  className="font-bold text-xl"
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
                className="absolute -bottom-1 -right-1 w-3 h-3 rotate-45"
                style={{
                  background: '#2D5A3D',
                  border: '1px solid #D4A574',
                }}
              />
            </div>

            {/* Logo text */}
            <div className="flex flex-col leading-tight">
              <span
                className="font-bold text-lg tracking-wide"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#F5E6D3',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                <span style={{ color: '#D4A574' }}>აჭარული</span>
                <span className="mx-1" style={{ color: '#8B6B4B' }}>•</span>
                <span style={{ color: '#F5E6D3' }}>სამუშაოები</span>
              </span>
              <span
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#8B6B4B',
                }}
              >
                Batumi & Adjara Jobs
              </span>
            </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Telegram button - Folk style */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #2D5A3D, #3D7A5D)',
                border: '2px solid #D4A574',
                boxShadow: '2px 2px 0 #3D2914',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0 #3D2914';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '2px 2px 0 #3D2914';
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ color: '#F5E6D3' }}>
                <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span
                className="hidden sm:inline text-sm font-semibold tracking-wide"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#F5E6D3',
                }}
              >
                {lang === 'ge' ? 'გამოწერა' : 'Subscribe'}
              </span>
            </a>

            {/* Language switcher - Traditional style */}
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{
                background: 'rgba(61, 41, 20, 0.5)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
              }}
            >
              {SUPPORTED_LANGUAGES.map((supportedLang) => (
                <Link
                  key={supportedLang}
                  to={getLanguageUrl(supportedLang)}
                  className="relative px-3 py-1.5 rounded-md font-semibold text-sm tracking-wide uppercase transition-all duration-200"
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
                  onMouseEnter={(e) => {
                    if (lang !== supportedLang) {
                      e.currentTarget.style.color = '#D4A574';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (lang !== supportedLang) {
                      e.currentTarget.style.color = '#8B6B4B';
                    }
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
