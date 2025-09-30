// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/public/service-worker.js
// Description: Service Worker for offline PWA functionality with caching strategies
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

const CACHE_NAME = 'focus-timer-v1';
const DYNAMIC_CACHE = 'focus-timer-dynamic-v1';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/timer-worker.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Parse URL for routing decisions
  const url = new URL(request.url);

  // API calls - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - Network First with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache First strategy - serve from cache, fallback to network
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache First failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network First strategy - try network, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Network First with offline fallback page
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline - Please check your connection', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Stale While Revalidate - serve from cache, update in background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('[Service Worker] Fetch failed:', error);
      return cachedResponse || new Response('Offline', { status: 503 });
    });

  return cachedResponse || fetchPromise;
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];

  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Handle background sync for session data
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered');

  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessionData());
  }
});

/**
 * Sync session data when connection is restored
 */
async function syncSessionData() {
  try {
    // Get pending sessions from IndexedDB
    const db = await openSessionDatabase();
    const pendingSessions = await getPendingSessions(db);

    if (pendingSessions.length > 0) {
      console.log('[Service Worker] Syncing', pendingSessions.length, 'sessions');

      // Send to server when online
      const response = await fetch('/api/sessions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: pendingSessions })
      });

      if (response.ok) {
        // Mark sessions as synced
        await markSessionsSynced(db, pendingSessions);
        console.log('[Service Worker] Sessions synced successfully');
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function openSessionDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FocusTimerDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingSessions(db) {
  // Implementation for getting pending sessions
  return [];
}

async function markSessionsSynced(db, sessions) {
  // Implementation for marking sessions as synced
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});