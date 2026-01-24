/**
 * MusicPlayer Component - Adjarian Folk Edition
 * Floating music player with traditional Georgian folk music
 * Auto-plays to create immersive cultural experience
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Music, Pause, Play, ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Traditional Georgian/Adjarian folk music tracks
// Using royalty-free traditional folk recordings
const MUSIC_TRACKS = [
  {
    id: 1,
    title: 'აჭარული მელოდია',
    titleEn: 'Adjarian Melody',
    artist: 'Traditional Folk',
    // Using a publicly available Georgian folk music stream
    url: 'https://stream.zeno.fm/0r0xa792kwzuv',
  },
];

const STORAGE_KEY = 'adjarian-music-preference';
const VOLUME_KEY = 'adjarian-music-volume';

interface MusicPreference {
  enabled: boolean;
  volume: number;
  dismissed: boolean;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [currentTrack] = useState(MUSIC_TRACKS[0]);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPref = localStorage.getItem(STORAGE_KEY);
      if (savedPref) {
        const pref: MusicPreference = JSON.parse(savedPref);
        if (pref.dismissed) {
          setIsDismissed(true);
          setShowPrompt(false);
        }
        if (pref.volume !== undefined) {
          setVolume(pref.volume);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save preferences
  const savePreference = useCallback((pref: Partial<MusicPreference>) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const current = existing ? JSON.parse(existing) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...pref }));
    } catch {
      // Ignore errors
    }
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
        setShowPrompt(false);
        savePreference({ enabled: true });
      }).catch((error) => {
        console.log('Autoplay prevented:', error);
        setShowPrompt(true);
      });
    }
  }, [isPlaying, savePreference]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    savePreference({ volume: newVolume });
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted, savePreference]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsDismissed(true);
    setShowPrompt(false);
    savePreference({ dismissed: true, enabled: false });
  }, [savePreference]);

  // Handle accept music
  const handleAccept = useCallback(() => {
    setShowPrompt(false);
    setHasInteracted(true);
    togglePlay();
  }, [togglePlay]);

  // Handle decline
  const handleDecline = useCallback(() => {
    setShowPrompt(false);
    savePreference({ dismissed: true });
    setIsDismissed(true);
  }, [savePreference]);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Try autoplay on mount (will likely fail but worth trying)
  useEffect(() => {
    if (isDismissed || hasInteracted) return;

    const attemptAutoplay = async () => {
      if (!audioRef.current) return;

      try {
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
        setShowPrompt(false);
        savePreference({ enabled: true });
      } catch {
        // Autoplay blocked - show prompt
        setShowPrompt(true);
      }
    };

    // Small delay to let component mount
    const timer = setTimeout(attemptAutoplay, 1000);
    return () => clearTimeout(timer);
  }, [isDismissed, hasInteracted, volume, savePreference]);

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        loop
        preload="auto"
      />

      {/* Music prompt overlay */}
      {showPrompt && !hasInteracted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="relative max-w-md mx-4 p-6 rounded-xl animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, #3D2914 0%, #4A3728 100%)',
              border: '3px solid #D4A574',
              boxShadow: '0 20px 60px rgba(61, 41, 20, 0.5)',
            }}
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D4A574] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#8B2635] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2D5A3D] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D4A574] rounded-br-lg" />

            {/* Music icon */}
            <div className="flex justify-center mb-4">
              <div
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(212, 165, 116, 0.2)',
                  border: '2px solid #D4A574',
                }}
              >
                <Music size={32} style={{ color: '#D4A574' }} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-xl font-bold text-center mb-2"
              style={{
                fontFamily: 'Playfair Display, serif',
                color: '#F5E6D3',
              }}
            >
              გამარჯობა! Welcome!
            </h3>

            {/* Description */}
            <p
              className="text-center mb-6 leading-relaxed"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: '#D4A574',
              }}
            >
              Would you like to enjoy traditional Adjarian folk music while browsing jobs?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 px-4 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                  border: '2px solid #3D2914',
                  boxShadow: '3px 3px 0 #3D2914',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '5px 5px 0 #3D2914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '3px 3px 0 #3D2914';
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Play size={18} />
                  Play Music
                </span>
              </button>

              <button
                onClick={handleDecline}
                className="flex-1 py-3 px-4 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: 'transparent',
                  border: '2px solid #6B4423',
                  color: '#D4A574',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(107, 68, 35, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating player */}
      {hasInteracted && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-40',
            'transition-all duration-300',
            isExpanded ? 'w-72' : 'w-14'
          )}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3D2914 0%, #4A3728 100%)',
              border: '3px solid #D4A574',
              boxShadow: '0 8px 32px rgba(61, 41, 20, 0.4)',
            }}
          >
            {/* Expanded view */}
            {isExpanded ? (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Music bars animation */}
                    <div className="flex items-end gap-0.5 h-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="music-player-bar"
                          style={{
                            height: isPlaying ? `${8 + Math.random() * 8}px` : '4px',
                            background: '#D4A574',
                            width: '3px',
                            borderRadius: '2px',
                            animation: isPlaying ? `music-bounce 0.${3 + i}s ease-in-out infinite` : 'none',
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#D4A574' }}
                    >
                      {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      style={{ color: '#D4A574' }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      style={{ color: '#8B6B4B' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Track info */}
                <div className="mb-3">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: '#F5E6D3' }}
                  >
                    {currentTrack.title}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: '#8B6B4B' }}
                  >
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                      boxShadow: '2px 2px 0 #3D2914',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={18} style={{ color: 'white' }} />
                    ) : (
                      <Play size={18} style={{ color: 'white' }} />
                    )}
                  </button>

                  {/* Volume */}
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    style={{ color: '#D4A574' }}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={18} />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>

                  {/* Volume slider */}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #D4A574 0%, #D4A574 ${(isMuted ? 0 : volume) * 100}%, #6B4423 ${(isMuted ? 0 : volume) * 100}%, #6B4423 100%)`,
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Minimized view */
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full p-3 flex items-center justify-center"
              >
                <div className="relative">
                  <Music size={24} style={{ color: '#D4A574' }} />
                  {isPlaying && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                      style={{
                        background: '#8B2635',
                        animation: 'warm-pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default MusicPlayer;
