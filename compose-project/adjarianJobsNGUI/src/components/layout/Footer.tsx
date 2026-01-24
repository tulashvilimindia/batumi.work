/**
 * Footer Component - Adjarian Folk Edition
 * Warm footer with traditional Georgian hospitality
 */

import { cn } from '@/lib';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'relative py-8 mt-auto',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #3D2914 0%, #2D1F0F 100%)',
        borderTop: '3px solid #D4A574',
      }}
    >
      {/* Decorative top pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4A574 0px, #D4A574 8px, transparent 8px, transparent 16px)',
        }}
      />

      {/* Traditional corner decorations */}
      <div className="absolute bottom-2 left-2 w-8 h-8">
        <div className="absolute bottom-0 left-0 w-6 h-[2px] bg-[#8B2635]" />
        <div className="absolute bottom-0 left-0 w-[2px] h-6 bg-[#8B2635]" />
      </div>
      <div className="absolute bottom-2 right-2 w-8 h-8">
        <div className="absolute bottom-0 right-0 w-6 h-[2px] bg-[#2D5A3D]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-6 bg-[#2D5A3D]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Logo & Copyright */}
          <div className="flex items-center gap-4">
            {/* Mini emblem */}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #8B2635, #6B1D29)',
                border: '2px solid #D4A574',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
              }}
            >
              <span
                className="font-bold text-lg"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#F5E6D3',
                }}
              >
                ა
              </span>
            </div>

            <div className="text-sm">
              <span style={{ color: '#8B6B4B' }}>&copy; {currentYear} </span>
              <span
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#D4A574',
                }}
              >
                აჭარული სამუშაოები
              </span>
              <span style={{ color: '#6B4423' }}> — </span>
              <span style={{ color: '#8B6B4B' }}>Adjarian Jobs</span>
            </div>
          </div>

          {/* Right side - Social links */}
          <div className="flex items-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(45, 90, 61, 0.3)',
                border: '1px solid rgba(45, 90, 61, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(45, 90, 61, 0.5)';
                e.currentTarget.style.borderColor = '#2D5A3D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(45, 90, 61, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(45, 90, 61, 0.5)';
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" style={{ color: '#4A9D6D' }}>
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.035.31.019.478z" />
              </svg>
              <span
                className="text-xs tracking-wide uppercase"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#4A9D6D',
                }}
              >
                Telegram
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:info@batumi.work"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(139, 38, 53, 0.3)',
                border: '1px solid rgba(139, 38, 53, 0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.5)';
                e.currentTarget.style.borderColor = '#8B2635';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 38, 53, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(139, 38, 53, 0.5)';
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#B84455' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span
                className="text-xs tracking-wide uppercase"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#B84455',
                }}
              >
                Contact
              </span>
            </a>
          </div>
        </div>

        {/* Bottom tagline - Georgian hospitality */}
        <div
          className="mt-6 pt-4 text-center"
          style={{ borderTop: '1px solid rgba(107, 68, 35, 0.3)' }}
        >
          <p
            className="text-xs tracking-wide"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#6B4423',
            }}
          >
            სტუმარი ღვთისგან მოვლინებულია
          </p>
          <p
            className="text-[10px] tracking-[0.2em] uppercase mt-1"
            style={{
              fontFamily: 'Source Sans Pro, sans-serif',
              color: '#4A3520',
            }}
          >
            A guest is sent by God — Georgian Proverb
          </p>
        </div>
      </div>
    </footer>
  );
}
