/**
 * Layout Component - Adjarian Folk Edition
 * Main layout wrapper with warm traditional background
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MusicPlayer } from '../music';
import { cn } from '@/lib';

interface LayoutProps {
  className?: string;
}

export function Layout({ className }: LayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col relative', className)}>
      {/* Adjarian Folk Background */}
      <AdjarianBackground />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
          <div className="max-w-[1100px] mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
}

/**
 * Warm Adjarian folk background with traditional patterns
 */
function AdjarianBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base warm gradient - like sunlight through a window */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FDF8F3 0%, #FAF0E4 30%, #F5E6D3 70%, #EDE0D0 100%)',
        }}
      />

      {/* Subtle cross-stitch pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #6B4423 1px, transparent 1px),
            linear-gradient(-45deg, #6B4423 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Warm sun glow from top */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.6) 0%, transparent 70%)',
        }}
      />

      {/* Soft mountain silhouette at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-5"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #2D5A3D 100%)',
          clipPath: 'polygon(0 100%, 10% 60%, 25% 80%, 40% 50%, 55% 70%, 70% 40%, 85% 65%, 100% 45%, 100% 100%)',
        }}
      />

      {/* Decorative corner borders - traditional carpet style */}
      <CornerDecoration position="top-left" />
      <CornerDecoration position="top-right" />
      <CornerDecoration position="bottom-left" />
      <CornerDecoration position="bottom-right" />

      {/* Floating folk particles */}
      <FolkParticles />
    </div>
  );
}

/**
 * Traditional corner decoration inspired by Georgian carpets
 */
function CornerDecoration({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div className={cn('absolute w-24 h-24 opacity-20', positionClasses[position])}>
      {/* Outer border */}
      <div
        className="absolute top-0 left-0 w-20 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #8B2635, transparent)' }}
      />
      <div
        className="absolute top-0 left-0 w-[3px] h-20"
        style={{ background: 'linear-gradient(180deg, #8B2635, transparent)' }}
      />
      {/* Inner accent */}
      <div
        className="absolute top-3 left-3 w-12 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #D4A574, transparent)' }}
      />
      <div
        className="absolute top-3 left-3 w-[2px] h-12"
        style={{ background: 'linear-gradient(180deg, #D4A574, transparent)' }}
      />
      {/* Diamond accent */}
      <div
        className="absolute top-6 left-6 w-3 h-3 rotate-45"
        style={{ background: '#2D5A3D' }}
      />
    </div>
  );
}

/**
 * Floating particles with folk colors
 */
function FolkParticles() {
  // Generate warm-colored particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 8,
    duration: Math.random() * 15 + 20,
    color: ['#D4A574', '#8B2635', '#2D5A3D', '#C4785A', '#E8B86D'][Math.floor(Math.random() * 5)],
  }));

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: 0.15,
            animation: `gentle-float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );
}
