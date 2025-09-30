// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/components/pwa/PWAStatusIndicator.tsx
// Description: PWA status indicator showing offline readiness and update notifications
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

'use client';

import React, { useState } from 'react';
import { useServiceWorker, useOfflineStatus, usePWAInstall } from '@/hooks/useServiceWorker';

export default function PWAStatusIndicator() {
  const { state, actions } = useServiceWorker();
  const { isOnline, canWorkOffline } = useOfflineStatus();
  const { canInstall, showInstallPrompt } = usePWAInstall();
  const [showDetails, setShowDetails] = useState(false);

  // Don't show anything if Service Workers aren't supported
  if (!state.isSupported) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline && canWorkOffline) return 'bg-yellow-500'; // Offline but functional
    if (!isOnline) return 'bg-red-500'; // Offline and not ready
    if (state.offlineReady) return 'bg-green-500'; // Online and offline ready
    if (state.isRegistered) return 'bg-blue-500'; // Service worker registered
    return 'bg-gray-500'; // Default
  };

  const getStatusText = () => {
    if (!isOnline && canWorkOffline) return 'Offline Mode Active';
    if (!isOnline) return 'Offline - Limited Functionality';
    if (state.offlineReady) return 'Offline Ready';
    if (state.isRegistered) return 'PWA Enabled';
    if (state.isInstalling) return 'Installing...';
    return 'Online Only';
  };

  const getStatusIcon = () => {
    if (!isOnline && canWorkOffline) return '📱'; // Offline but working
    if (!isOnline) return '📵'; // Offline
    if (state.offlineReady) return '✅'; // Ready
    if (state.isRegistered) return '🔄'; // Loading
    return '🌐'; // Online only
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main Status Indicator */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-white text-sm cursor-pointer transition-all ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
        data-testid="pwa-status-indicator"
      >
        <span className="text-base">{getStatusIcon()}</span>
        <span className="font-medium">{getStatusText()}</span>
      </div>

      {/* Notifications */}
      {state.updateAvailable && (
        <div className="mt-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <div className="flex items-center justify-between gap-2">
            <span>Update available!</span>
            <button
              onClick={actions.skipWaiting}
              className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
              data-testid="update-app-button"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {canInstall && (
        <div className="mt-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <div className="flex items-center justify-between gap-2">
            <span>Install app?</span>
            <button
              onClick={showInstallPrompt}
              className="bg-white text-green-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
              data-testid="install-app-button"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {state.error && (
        <div className="mt-2 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          <div className="flex items-center justify-between gap-2">
            <span>Error: {state.error}</span>
            <button
              onClick={() => actions.register()}
              className="bg-white text-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
              data-testid="retry-sw-button"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm max-w-xs">
          <h3 className="font-bold text-gray-800 mb-2">PWA Status</h3>

          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Service Worker:</span>
              <span className={state.isRegistered ? 'text-green-600' : 'text-red-600'}>
                {state.isRegistered ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Offline Ready:</span>
              <span className={state.offlineReady ? 'text-green-600' : 'text-gray-400'}>
                {state.offlineReady ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Network:</span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Can Work Offline:</span>
              <span className={canWorkOffline ? 'text-green-600' : 'text-red-600'}>
                {canWorkOffline ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => actions.update()}
              className="w-full bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 mb-2"
              data-testid="check-updates-button"
            >
              Check for Updates
            </button>

            <button
              onClick={() => actions.unregister()}
              className="w-full bg-gray-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-gray-600"
              data-testid="disable-pwa-button"
            >
              Disable PWA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}