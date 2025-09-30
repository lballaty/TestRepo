// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/hooks/useServiceWorker.ts
// Description: React hook for Service Worker integration and PWA functionality
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isControlling: boolean;
  updateAvailable: boolean;
  offlineReady: boolean;
  needRefresh: boolean;
  error: string | null;
}

interface ServiceWorkerActions {
  register: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => void;
  unregister: () => Promise<boolean>;
  showInstallPrompt: () => Promise<void>;
}

interface ServiceWorkerHook {
  state: ServiceWorkerState;
  actions: ServiceWorkerActions;
}

export const useServiceWorker = (): ServiceWorkerHook => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isControlling: false,
    updateAvailable: false,
    offlineReady: false,
    needRefresh: false,
    error: null,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    // Check if Service Workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setState(prev => ({ ...prev, isSupported: true }));

      // Listen for install prompt
      const handleBeforeInstallPrompt = (event: any) => {
        event.preventDefault();
        setInstallPromptEvent(event);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Auto-register service worker
      registerServiceWorker();

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const registerServiceWorker = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isInstalling: true, error: null }));

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      setRegistration(registration);

      setState(prev => ({
        ...prev,
        isRegistered: true,
        isInstalling: false,
        isControlling: !!navigator.serviceWorker.controller,
      }));

      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setState(prev => ({ ...prev, isWaiting: true }));

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Update available
                setState(prev => ({
                  ...prev,
                  updateAvailable: true,
                  needRefresh: true,
                }));
              } else {
                // First time installation
                setState(prev => ({
                  ...prev,
                  offlineReady: true,
                }));
              }
            }
          });
        }
      });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState(prev => ({
          ...prev,
          isControlling: true,
          needRefresh: false,
        }));
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setState(prev => ({
        ...prev,
        isInstalling: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  const updateServiceWorker = async (): Promise<void> => {
    if (!registration) return;

    try {
      await registration.update();
      setState(prev => ({ ...prev, error: null }));
    } catch (error) {
      console.error('Service Worker update failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Update failed',
      }));
    }
  };

  const skipWaitingServiceWorker = (): void => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const unregisterServiceWorker = async (): Promise<boolean> => {
    if (!registration) return false;

    try {
      const result = await registration.unregister();
      if (result) {
        setState(prev => ({
          ...prev,
          isRegistered: false,
          isControlling: false,
          updateAvailable: false,
          offlineReady: false,
          needRefresh: false,
        }));
        setRegistration(null);
      }
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unregistration failed',
      }));
      return false;
    }
  };

  const showInstallPrompt = async (): Promise<void> => {
    if (!installPromptEvent) return;

    try {
      const result = await installPromptEvent.prompt();
      console.log('Install prompt result:', result);

      // Clear the prompt event
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Install prompt failed',
      }));
    }
  };

  const actions: ServiceWorkerActions = {
    register: registerServiceWorker,
    update: updateServiceWorker,
    skipWaiting: skipWaitingServiceWorker,
    unregister: unregisterServiceWorker,
    showInstallPrompt,
  };

  return {
    state,
    actions,
  };
};

// Additional utility hook for PWA install prompt
export const usePWAInstall = () => {
  const { state, actions } = useServiceWorker();

  return {
    canInstall: !!state.isSupported,
    isInstallable: state.isSupported && !state.error,
    showInstallPrompt: actions.showInstallPrompt,
  };
};

// Hook for offline status with Service Worker integration
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { state } = useServiceWorker();

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    hasServiceWorker: state.isRegistered,
    isOfflineReady: state.offlineReady,
    canWorkOffline: state.isRegistered && state.offlineReady,
  };
};