/**
 * MusicPlayer Component - Adjarian Folk Edition
 * Simple play/pause button with autoplay for Ajaruli Gandagana
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

// Ajaruli Gandagana - Traditional Adjarian folk dance music
// Using a Georgian folk music radio stream
const MUSIC_URL = 'https://stream.zeno.fm/0r0xa792kwzuv';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Try autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    // Attempt autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked - user needs to click
          setIsPlaying(false);
        });
    }
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        loop
        preload="auto"
      />

      {/* Simple floating player */}
      <div
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2"
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        {/* Volume control - shows on hover */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300"
          style={{
            background: 'rgba(61, 41, 20, 0.95)',
            border: '2px solid #D4A574',
            opacity: showVolume ? 1 : 0,
            transform: showVolume ? 'translateX(0)' : 'translateX(20px)',
            pointerEvents: showVolume ? 'auto' : 'none',
          }}
        >
          <button
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            style={{ color: '#D4A574' }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4A574 0%, #D4A574 ${(isMuted ? 0 : volume) * 100}%, #6B4423 ${(isMuted ? 0 : volume) * 100}%, #6B4423 100%)`,
            }}
            aria-label="Volume"
          />
        </div>

        {/* Main play/pause button */}
        <button
          onClick={togglePlay}
          className="relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 hover:scale-110"
          style={{
            background: isPlaying
              ? 'linear-gradient(135deg, #2D5A3D, #3D7A5D)'
              : 'linear-gradient(135deg, #8B2635, #A83C4B)',
            border: '3px solid #D4A574',
            boxShadow: '0 4px 20px rgba(61, 41, 20, 0.4), 3px 3px 0 #3D2914',
          }}
          aria-label={isPlaying ? 'Pause Ajaruli Gandagana' : 'Play Ajaruli Gandagana'}
        >
          {isPlaying ? (
            <Pause size={24} style={{ color: '#F5E6D3' }} />
          ) : (
            <Play size={24} style={{ color: '#F5E6D3', marginLeft: 2 }} />
          )}

          {/* Playing indicator */}
          {isPlaying && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center"
              style={{
                width: 20,
                height: 20,
                background: '#D4A574',
                borderRadius: '50%',
                border: '2px solid #3D2914',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#8B2635',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
            </span>
          )}
        </button>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </>
  );
}

export default MusicPlayer;
