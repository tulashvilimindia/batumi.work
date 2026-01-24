/**
 * MusicPlayer Component - Adjarian Folk Edition
 * Compact music player button for header integration
 * Robust autoplay with muted start, unmute on interaction
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

// Georgian folk music radio stream
const MUSIC_URL = 'https://stream.zeno.fm/0r0xa792kwzuv';

export interface MusicPlayerProps {
  /** Compact mode for header */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

export function MusicPlayer({ compact = false, className }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Configure audio volume on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume (muted, so this is for when unmuted)
    audio.volume = 0.5;
  }, []);

  // Handle first user interaction to unmute
  useEffect(() => {
    if (hasInteracted) return;

    const handleInteraction = () => {
      const audio = audioRef.current;
      if (!audio) return;

      setHasInteracted(true);

      // Unmute if playing
      if (isPlaying) {
        audio.muted = false;
        audio.volume = 0.5;
        setIsMuted(false);
      }
    };

    // Listen for any interaction
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted, isPlaying]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Unmute and play
      audio.muted = false;
      audio.volume = 0.5;
      setIsMuted(false);
      setHasInteracted(true);

      audio.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  }, [isPlaying]);

  // Toggle mute (for when hovering/clicking mute button)
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      audio.volume = 0.5;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  // Determine button color based on state
  const getButtonStyle = () => {
    if (isLoading) {
      return {
        background: 'linear-gradient(135deg, #6B4423, #8B5A2B)',
        borderColor: '#D4A574',
      };
    }
    if (isPlaying && !isMuted) {
      return {
        background: 'linear-gradient(135deg, #2D5A3D, #3D7A5D)',
        borderColor: '#D4A574',
      };
    }
    if (isPlaying && isMuted) {
      return {
        background: 'linear-gradient(135deg, #D4A574, #E8C49A)',
        borderColor: '#6B4423',
      };
    }
    return {
      background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
      borderColor: '#D4A574',
    };
  };

  const buttonStyle = getButtonStyle();

  return (
    <>
      {/* Hidden audio element - autoplay + muted required for browser policy compliance */}
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        loop
        playsInline
        muted
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlayThrough={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />

      {/* Music player button */}
      <div
        className={cn('relative', className)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={togglePlay}
          className={cn(
            'relative flex items-center justify-center',
            'rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[#D4A574]',
            compact ? 'w-9 h-9' : 'w-10 h-10',
            'hover:scale-105'
          )}
          style={{
            ...buttonStyle,
            border: `2px solid ${buttonStyle.borderColor}`,
            boxShadow: '2px 2px 0 #3D2914',
          }}
          aria-label={isPlaying ? 'Pause music' : 'Play Adjarian folk music'}
        >
          {isLoading ? (
            <Music
              size={compact ? 16 : 18}
              className="animate-pulse"
              style={{ color: '#D4A574' }}
            />
          ) : isPlaying ? (
            isMuted ? (
              <VolumeX size={compact ? 16 : 18} style={{ color: '#3D2914' }} />
            ) : (
              <Volume2 size={compact ? 16 : 18} style={{ color: '#F5E6D3' }} />
            )
          ) : (
            <Music size={compact ? 16 : 18} style={{ color: '#F5E6D3' }} />
          )}

          {/* Playing indicator dot */}
          {isPlaying && !isMuted && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: '#D4A574',
                border: '1px solid #3D2914',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs whitespace-nowrap z-50"
            style={{
              background: '#3D2914',
              color: '#F5E6D3',
              fontFamily: 'Source Sans Pro, sans-serif',
            }}
          >
            {isLoading
              ? 'იტვირთება...'
              : isPlaying
                ? (isMuted ? 'ხმა ჩართე' : 'აჭარული მუსიკა')
                : 'დაკვრა'
            }
          </div>
        )}

        {/* Mute toggle on hover - only show when playing */}
        {isPlaying && showTooltip && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{
              background: isMuted ? '#8B2635' : '#2D5A3D',
              border: '1px solid #D4A574',
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX size={10} style={{ color: '#F5E6D3' }} />
            ) : (
              <Volume2 size={10} style={{ color: '#F5E6D3' }} />
            )}
          </button>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
    </>
  );
}

export default MusicPlayer;
