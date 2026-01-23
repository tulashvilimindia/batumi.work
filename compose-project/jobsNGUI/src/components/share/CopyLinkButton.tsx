/**
 * CopyLinkButton Component
 * Button to copy URL to clipboard with toast notification
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

export interface CopyLinkButtonProps {
  /** URL to copy */
  url: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show label text */
  showLabel?: boolean;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Additional class names */
  className?: string;
  /** Callback after successful copy */
  onCopy?: () => void;
  /** Callback for toast notification (alternative to internal state) */
  onSuccess?: (message: string) => void;
}

const sizeConfig = {
  sm: { button: 'h-8 px-2', icon: 'w-4 h-4', text: 'text-sm' },
  md: { button: 'h-10 px-3', icon: 'w-5 h-5', text: 'text-sm' },
  lg: { button: 'h-12 px-4', icon: 'w-6 h-6', text: 'text-base' },
};

const variantConfig = {
  default:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
};

/**
 * CopyLinkButton component for copying URLs to clipboard
 *
 * @example
 * <CopyLinkButton
 *   url={window.location.href}
 *   showLabel
 *   onSuccess={(msg) => toast.success(msg)}
 * />
 */
export function CopyLinkButton({
  url,
  size = 'md',
  showLabel = false,
  variant = 'default',
  className,
  onCopy,
  onSuccess,
}: CopyLinkButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      // Use Clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
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

      // Show copied state
      setCopied(true);

      // Trigger callbacks
      onCopy?.();
      onSuccess?.(t('share.copied'));

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [url, onCopy, onSuccess, t]);

  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={copied}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70',
        sizeStyles.button,
        variantStyles,
        copied && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        className
      )}
      aria-label={copied ? t('share.copied') : t('share.copyLink')}
      title={copied ? t('share.copied') : t('share.copyLink')}
    >
      {copied ? (
        <>
          <Check className={cn(sizeStyles.icon, 'text-green-600 dark:text-green-400')} />
          {showLabel && (
            <span className={cn(sizeStyles.text, 'text-green-700 dark:text-green-400')}>
              {t('share.copied')}
            </span>
          )}
        </>
      ) : (
        <>
          <Copy className={sizeStyles.icon} />
          {showLabel && <span className={sizeStyles.text}>{t('share.copyLink')}</span>}
        </>
      )}
    </button>
  );
}

export default CopyLinkButton;
