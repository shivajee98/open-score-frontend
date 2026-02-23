/* eslint-disable no-undef */
/**
 * Firebase Messaging Service Worker
 * Handles background push notifications when the browser tab is not in focus.
 * 
 * This file MUST be in the /public directory so it's served at the root URL.
 * Firebase SDK will automatically look for it at /firebase-messaging-sw.js
 */

// Import Firebase scripts (compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// These values must match your Firebase project config
firebase.initializeApp({
    apiKey: 'AIzaSyAb08cUv5j13pPcmuacoAt3DC8hVdf3wFU',
    authDomain: 'open-score-3f0da.firebaseapp.com',
    projectId: 'open-score-3f0da',
    storageBucket: 'open-score-3f0da.firebasestorage.app',
    messagingSenderId: '190101745853',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'OpenScore';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: payload.data?.type || 'default',
        data: payload.data || {},
        // Vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Open App' },
        ],
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    event.notification.close();

    // Navigate to the app when notification is clicked
    const urlToOpen = event.notification.data?.path || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If a window is already open, focus it
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
