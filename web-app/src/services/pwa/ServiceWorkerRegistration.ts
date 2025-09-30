// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/services/pwa/ServiceWorkerRegistration.ts
// Description: Service Worker registration and management for offline PWA functionality
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable: boolean = false;
  private config: ServiceWorkerConfig = {};

  /**
   * Register the service worker for offline functionality
   *
   * Business Purpose: Enables the app to work offline and provides
   * better performance through intelligent caching strategies
   */
  public async register(config: ServiceWorkerConfig = {}): Promise<void> {
    this.config = config;

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    // Only register in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_SW) {
      console.log('Service Worker registration skipped in development');
      return;
    }

    try {
      // Wait for window load to not impact initial page load performance
      window.addEventListener('load', async () => {
        await this.registerServiceWorker();
      });

      // Set up online/offline listeners
      this.setupNetworkListeners();

      // Check for updates periodically
      this.setupUpdateCheck();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      if (this.config.onError) {
        this.config.onError(error as Error);
      }
    }
  }

  /**
   * Register the service worker file
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      this.registration = registration;
      console.log('Service Worker registered successfully');

      // Handle successful registration
      if (this.config.onSuccess) {
        this.config.onSuccess(registration);
      }

      // Check for updates
      registration.addEventListener('updatefound', () => {
        this.handleUpdateFound(registration);
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.handleControllerChange();
      });

    } catch (error) {
      console.error('Service Worker registration error:', error);
      throw error;
    }
  }

  /**
   * Handle when a new service worker is found
   */
  private handleUpdateFound(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;

    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New update available
        this.updateAvailable = true;
        console.log('New app update available');

        if (this.config.onUpdate) {
          this.config.onUpdate(registration);
        }

        // Show update notification to user
        this.showUpdateNotification();
      }
    });
  }

  /**
   * Handle controller change (new SW activated)
   */
  private handleControllerChange(): void {
    // Reload the page when new SW takes control
    if (this.updateAvailable) {
      console.log('New Service Worker activated, reloading...');
      window.location.reload();
    }
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    const shouldUpdate = window.confirm(
      'A new version of the Focus Timer is available. Would you like to update?'
    );

    if (shouldUpdate) {
      this.skipWaitingAndReload();
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  public skipWaitingAndReload(): void {
    if (!this.registration?.waiting) return;

    // Tell SW to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload will happen via controllerchange event
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Back online');
      if (this.config.onOnline) {
        this.config.onOnline();
      }

      // Trigger background sync
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      if (this.config.onOffline) {
        this.config.onOffline();
      }
    });
  }

  /**
   * Trigger background sync for pending data
   */
  private async triggerBackgroundSync(): Promise<void> {
    if (!this.registration) return;

    try {
      // Register sync event
      await (this.registration as any).sync?.register('sync-sessions');
      console.log('Background sync registered');
    } catch (error) {
      console.log('Background sync not supported');
    }
  }

  /**
   * Set up periodic update checks
   */
  private setupUpdateCheck(): void {
    // Check for updates every hour
    setInterval(() => {
      this.checkForUpdates();
    }, 60 * 60 * 1000);

    // Also check when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Check for service worker updates
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  /**
   * Clear all caches (for debugging/reset)
   */
  public async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }

    // Also tell SW to clear
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  /**
   * Unregister service worker completely
   */
  public async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
      console.log('Service Worker unregistered');
    }
  }

  /**
   * Check if app is running offline
   */
  public isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Check if update is available
   */
  public hasUpdate(): boolean {
    return this.updateAvailable;
  }

  /**
   * Get registration status
   */
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Register service worker with default config
 */
export function registerServiceWorker(config?: ServiceWorkerConfig): Promise<void> {
  return serviceWorkerManager.register(config);
}

/**
 * Unregister service worker
 */
export function unregisterServiceWorker(): Promise<void> {
  return serviceWorkerManager.unregister();
}