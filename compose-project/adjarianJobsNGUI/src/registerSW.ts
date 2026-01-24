/**
 * Service Worker Registration
 * Registers and manages the service worker for PWA functionality
 */

type UpdateCallback = (registration: ServiceWorkerRegistration) => void;

interface RegisterSWConfig {
  /** Callback when SW is ready */
  onReady?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when new update is available */
  onUpdate?: UpdateCallback;
  /** Callback when SW is registered for first time */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  /** Callback when offline */
  onOffline?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Register the service worker
 *
 * @param config - Configuration callbacks
 *
 * @example
 * registerSW({
 *   onReady: () => console.log('SW ready'),
 *   onUpdate: () => console.log('New content available'),
 *   onOffline: () => console.log('App is offline'),
 * });
 */
export function registerSW(config: RegisterSWConfig = {}): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      registerValidSW(swUrl, config);
    });
  }
}

async function registerValidSW(swUrl: string, config: RegisterSWConfig): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    // Check for updates periodically
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker === null) return;

      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available
            console.log('New content is available; please refresh.');
            config.onUpdate?.(registration);
          } else {
            // Content cached for first time
            console.log('Content is cached for offline use.');
            config.onSuccess?.(registration);
          }
        }
      });
    });

    // SW is ready
    if (registration.active) {
      config.onReady?.(registration);
    }

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New SW has taken control
      window.location.reload();
    });

    // Periodic update check
    setInterval(
      () => {
        registration.update().catch((error) => {
          console.warn('SW update check failed:', error);
        });
      },
      60 * 60 * 1000
    ); // Check every hour
  } catch (error) {
    console.error('Error during service worker registration:', error);
    config.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Unregister all service workers
 * Useful for development or troubleshooting
 */
export async function unregisterSW(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const success = await registration.unregister();
      if (success) {
        console.log('Service worker unregistered');
      }
      return success;
    } catch (error) {
      console.error('Error unregistering service worker:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if app is running as installed PWA
 */
export function isRunningAsPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

/**
 * Check if the app can be installed
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Capture the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

/**
 * Check if app can be installed
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Prompt user to install the app
 * @returns Promise that resolves with the user's choice
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome;
  } catch (error) {
    console.error('Install prompt failed:', error);
    return 'unavailable';
  }
}

/**
 * Listen for app installed event
 */
export function onAppInstalled(callback: () => void): () => void {
  const handler = () => {
    callback();
    deferredPrompt = null;
  };

  window.addEventListener('appinstalled', handler);

  return () => {
    window.removeEventListener('appinstalled', handler);
  };
}

export default registerSW;
