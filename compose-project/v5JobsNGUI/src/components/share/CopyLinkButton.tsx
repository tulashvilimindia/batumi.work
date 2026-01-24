/**
 * CopyLinkButton Component - Cyberpunk Neon Edition
 * Copy URL with neon glow feedback animation
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Copy, Check, Zap } from 'lucide-react';

export interface CopyLinkButtonProps {
  /** URL to copy */
  url: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show label text */
  showLabel?: boolean;
  /** Additional class names */
  className?: string;
  /** Callback after successful copy */
  onCopy?: () => void;
  /** Callback for toast notification */
  onSuccess?: (message: string) => void;
}

const sizeConfig = {
  sm: { button: 'h-9 w-9', icon: 'w-4 h-4', text: 'text-xs' },
  md: { button: 'h-11 w-11', icon: 'w-5 h-5', text: 'text-sm' },
  lg: { button: 'h-13 w-13', icon: 'w-6 h-6', text: 'text-base' },
};

/**
 * Cyberpunk CopyLinkButton with neon glow effects
 */
export function CopyLinkButton({
  url,
  size = 'md',
  showLabel = false,
  className,
  onCopy,
  onSuccess,
}: CopyLinkButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error('Copy command failed');
        }
      }

      setCopied(true);
      onCopy?.();
      onSuccess?.(t('share.copied'));

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [url, onCopy, onSuccess, t]);

  const sizeStyles = sizeConfig[size];

  // Color configuration
  const defaultColor = '#8B5CF6';
  const defaultGlow = 'rgba(139, 92, 246, 0.5)';
  const successColor = '#39FF14';
  const successGlow = 'rgba(57, 255, 20, 0.5)';

  const currentColor = copied ? successColor : defaultColor;
  const currentGlow = copied ? successGlow : defaultGlow;

  return (
    <button
      type="button"
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={copied}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl',
        'transition-all duration-300',
        'focus:outline-none',
        'disabled:cursor-default',
        sizeStyles.button,
        showLabel && 'w-auto px-4',
        className
      )}
      style={{
        background: copied
          ? `${successColor}20`
          : isHovered
            ? `${defaultColor}20`
            : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${copied ? `${successColor}80` : isHovered ? `${defaultColor}80` : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: copied || isHovered
          ? `0 0 20px ${currentGlow}, 0 0 40px ${currentGlow}`
          : 'none',
        transform: isHovered && !copied ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
      }}
      aria-label={copied ? t('share.copied') : t('share.copyLink')}
      title={copied ? t('share.copied') : t('share.copyLink')}
    >
      {/* Background pulse on copy */}
      {copied && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${successColor}40, transparent 70%)`,
            animation: 'pulse-glow 1s ease-out',
          }}
        />
      )}

      {/* Hover glow */}
      {isHovered && !copied && (
        <div
          className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${defaultColor}40, transparent 70%)`,
          }}
        />
      )}

      {/* Icon */}
      <span
        className={cn(sizeStyles.icon, 'relative z-10 transition-all duration-300')}
        style={{
          color: copied ? successColor : isHovered ? defaultColor : '#A0A0B0',
          filter: copied || isHovered ? `drop-shadow(0 0 8px ${currentGlow})` : 'none',
        }}
      >
        {copied ? (
          <Check className={sizeStyles.icon} aria-hidden="true" />
        ) : (
          <Copy className={sizeStyles.icon} aria-hidden="true" />
        )}
      </span>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            sizeStyles.text,
            'relative z-10 font-semibold tracking-wider uppercase transition-all duration-300'
          )}
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: copied ? successColor : isHovered ? defaultColor : '#A0A0B0',
            textShadow: copied || isHovered ? `0 0 10px ${currentGlow}` : 'none',
          }}
        >
          {copied ? t('share.copied') : t('share.copyLink')}
        </span>
      )}

      {/* Success spark particles */}
      {copied && (
        <>
          <div
            className="absolute top-0 left-1/2 w-1 h-1 rounded-full"
            style={{
              background: successColor,
              boxShadow: `0 0 6px ${successGlow}`,
              animation: 'spark-up 0.5s ease-out forwards',
            }}
          />
          <div
            className="absolute top-1/2 right-0 w-1 h-1 rounded-full"
            style={{
              background: successColor,
              boxShadow: `0 0 6px ${successGlow}`,
              animation: 'spark-right 0.5s ease-out forwards',
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full"
            style={{
              background: successColor,
              boxShadow: `0 0 6px ${successGlow}`,
              animation: 'spark-down 0.5s ease-out forwards',
            }}
          />
        </>
      )}

      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-2 h-[1px]"
        style={{
          background: currentColor,
          boxShadow: `0 0 4px ${currentGlow}`,
          opacity: copied || isHovered ? 1 : 0.3,
        }}
      />
      <div
        className="absolute top-0 left-0 w-[1px] h-2"
        style={{
          background: currentColor,
          boxShadow: `0 0 4px ${currentGlow}`,
          opacity: copied || isHovered ? 1 : 0.3,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-[1px]"
        style={{
          background: currentColor,
          boxShadow: `0 0 4px ${currentGlow}`,
          opacity: copied || isHovered ? 1 : 0.3,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[1px] h-2"
        style={{
          background: currentColor,
          boxShadow: `0 0 4px ${currentGlow}`,
          opacity: copied || isHovered ? 1 : 0.3,
        }}
      />
    </button>
  );
}

export default CopyLinkButton;
