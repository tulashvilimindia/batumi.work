/**
 * Footer Component - Cyberpunk Neon Edition
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
        'bg-surface-solid/80 backdrop-blur-[20px]',
        'border-t border-glass-border',
        className
      )}
    >
      {/* Top neon border */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #8B5CF6, #FF006E, #00F5FF, transparent)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Logo & Copyright */}
          <div className="flex items-center gap-4">
            {/* Mini logo */}
            <div
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-pink"
              style={{
                borderRadius: '4px 10px 4px 10px',
                boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
              }}
            >
              <span className="font-bold text-sm text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>F</span>
            </div>

            <div className="text-sm">
              <span className="text-text-tertiary">&copy; {currentYear} </span>
              <span
                className="text-neon-cyan"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
                }}
              >
                FANCY.JOBS
              </span>
              <span className="text-text-tertiary"> - Cyberpunk Job Board</span>
            </div>
          </div>

          {/* Right side - Social links */}
          <div className="flex items-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/batumiworkofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300"
              style={{
                boxShadow: '0 0 10px rgba(0, 245, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 245, 255, 0.1)';
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-neon-cyan">
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.035.31.019.478z" />
              </svg>
              <span
                className="text-xs text-neon-cyan tracking-wider uppercase"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Telegram
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:info@batumi.work"
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-pink/5 border border-neon-pink/20 hover:border-neon-pink/50 transition-all duration-300"
              style={{
                boxShadow: '0 0 10px rgba(255, 0, 110, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 110, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 110, 0.1)';
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-neon-pink" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span
                className="text-xs text-neon-pink tracking-wider uppercase"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Contact
              </span>
            </a>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <p
            className="text-[10px] text-text-tertiary tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Powered by Neon Technology // Batumi & Adjara Region
          </p>
        </div>
      </div>

      {/* Bottom corner accents */}
      <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
      <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-neon-purple" style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
      <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
      <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-neon-cyan" style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
    </footer>
  );
}
