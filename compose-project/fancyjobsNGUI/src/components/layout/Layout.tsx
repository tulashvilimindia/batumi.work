/**
 * Layout Component - Cyberpunk Neon Edition
 * Main layout wrapper with animated background effects
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib';

interface LayoutProps {
  className?: string;
}

export function Layout({ className }: LayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col relative', className)}>
      {/* Animated Background */}
      <CyberpunkBackground />

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
    </div>
  );
}

/**
 * Animated cyberpunk background with floating particles
 */
function CyberpunkBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at top, #0f0f1a 0%, #050508 50%, #020203 100%)',
        }}
      />

      {/* Animated aurora effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(45deg, rgba(0, 245, 255, 0.05) 0%, transparent 30%, rgba(255, 0, 110, 0.05) 50%, transparent 70%, rgba(139, 92, 246, 0.05) 100%)',
          backgroundSize: '400% 400%',
          animation: 'aurora-shift 15s ease infinite',
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-[100px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          animation: 'float-orb-1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full blur-[80px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 110, 0.4) 0%, transparent 70%)',
          top: '50%',
          right: '10%',
          animation: 'float-orb-2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full blur-[60px] opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
          bottom: '20%',
          left: '30%',
          animation: 'float-orb-3 18s ease-in-out infinite',
        }}
      />

      {/* Horizontal neon lines */}
      <div
        className="absolute left-0 right-0 h-[1px] opacity-10"
        style={{
          top: '25%',
          background: 'linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), transparent)',
        }}
      />
      <div
        className="absolute left-0 right-0 h-[1px] opacity-10"
        style={{
          top: '75%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 0, 110, 0.5), transparent)',
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-32 h-32 opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.3) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-20"
        style={{
          background: 'linear-gradient(-135deg, rgba(255, 0, 110, 0.3) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 opacity-20"
        style={{
          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
        style={{
          background: 'linear-gradient(-45deg, rgba(57, 255, 20, 0.3) 0%, transparent 50%)',
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />
    </div>
  );
}

/**
 * Floating particle dots for extra ambiance
 */
function FloatingParticles() {
  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
    color: ['#00F5FF', '#FF006E', '#8B5CF6', '#39FF14'][Math.floor(Math.random() * 4)],
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
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            opacity: 0.4,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );
}
