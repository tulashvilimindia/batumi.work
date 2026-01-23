/**
 * NotFoundPage - Cyberpunk Neon Edition
 * 404 error page with glitch effects
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib';
import { AlertTriangle, Home, Zap } from 'lucide-react';

export function NotFoundPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'min-h-[60vh] text-center py-12 px-4'
      )}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 0, 110, 0.1) 0%, transparent 60%)',
        }}
      />

      {/* Glitchy 404 */}
      <div className="relative mb-6">
        <div
          className="text-[120px] md:text-[180px] font-black leading-none"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #FF006E 0%, #8B5CF6 50%, #00F5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 30px rgba(255, 0, 110, 0.5))',
          }}
        >
          404
        </div>

        {/* Glitch layers */}
        <div
          className="absolute inset-0 text-[120px] md:text-[180px] font-black leading-none pointer-events-none"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: '#00F5FF',
            opacity: 0.3,
            animation: 'glitch-1 2s infinite linear alternate-reverse',
            clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)',
          }}
        >
          404
        </div>
        <div
          className="absolute inset-0 text-[120px] md:text-[180px] font-black leading-none pointer-events-none"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: '#FF006E',
            opacity: 0.3,
            animation: 'glitch-2 2.5s infinite linear alternate-reverse',
            clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)',
          }}
        >
          404
        </div>

        {/* Electricity sparks */}
        <Zap
          className="absolute -top-4 -right-4 text-[#FFE600] animate-pulse"
          size={32}
          style={{ filter: 'drop-shadow(0 0 10px rgba(255, 230, 0, 0.8))' }}
        />
      </div>

      {/* Warning icon */}
      <div
        className="mb-4 p-4 rounded-full"
        style={{
          background: 'rgba(255, 0, 110, 0.1)',
          border: '1px solid rgba(255, 0, 110, 0.3)',
          boxShadow: '0 0 30px rgba(255, 0, 110, 0.2)',
        }}
      >
        <AlertTriangle
          size={32}
          style={{
            color: '#FF006E',
            filter: 'drop-shadow(0 0 10px rgba(255, 0, 110, 0.5))',
          }}
        />
      </div>

      {/* Title */}
      <h1
        className="text-2xl md:text-3xl font-bold mb-3"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          color: '#F0F0F5',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
        }}
      >
        SIGNAL LOST
      </h1>

      {/* Description */}
      <p
        className="text-base md:text-lg max-w-md mb-8 leading-relaxed"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          color: '#A0A0B0',
        }}
      >
        The neural pathway you're searching for has been disconnected, relocated, or never existed in this dimension.
      </p>

      {/* Back to Home Button */}
      <Link
        to="/"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative inline-flex items-center gap-3',
          'px-8 py-4 rounded-xl',
          'font-bold tracking-wider uppercase',
          'transition-all duration-300',
          'focus:outline-none'
        )}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '14px',
          background: isHovered
            ? 'linear-gradient(135deg, rgba(0, 245, 255, 0.2), rgba(139, 92, 246, 0.2))'
            : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isHovered ? 'rgba(0, 245, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
          color: isHovered ? '#00F5FF' : '#E0E0E8',
          boxShadow: isHovered
            ? '0 0 30px rgba(0, 245, 255, 0.3), 0 0 60px rgba(0, 245, 255, 0.2)'
            : 'none',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          textShadow: isHovered ? '0 0 10px rgba(0, 245, 255, 0.5)' : 'none',
        }}
      >
        {/* Icon */}
        <Home
          size={18}
          style={{
            filter: isHovered ? 'drop-shadow(0 0 5px rgba(0, 245, 255, 0.8))' : 'none',
          }}
        />
        RETURN TO BASE

        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-3 h-[1px]"
          style={{
            background: '#00F5FF',
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? '0 0 5px rgba(0, 245, 255, 0.8)' : 'none',
          }}
        />
        <div
          className="absolute top-0 left-0 w-[1px] h-3"
          style={{
            background: '#00F5FF',
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? '0 0 5px rgba(0, 245, 255, 0.8)' : 'none',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-3 h-[1px]"
          style={{
            background: '#FF006E',
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? '0 0 5px rgba(255, 0, 110, 0.8)' : 'none',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[1px] h-3"
          style={{
            background: '#FF006E',
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? '0 0 5px rgba(255, 0, 110, 0.8)' : 'none',
          }}
        />
      </Link>

      {/* Decorative scan lines */}
      <div
        className="absolute bottom-10 left-0 right-0 h-[1px] opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), transparent)',
        }}
      />
      <div
        className="absolute bottom-20 left-0 right-0 h-[1px] opacity-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 0, 110, 0.5), transparent)',
        }}
      />
    </div>
  );
}
