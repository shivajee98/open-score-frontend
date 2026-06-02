import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';

// Firebase Web Config - from your google-services.json / Firebase Console
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAb08cUv5j13pPcmuacoAt3DC8hVdf3wFU',
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'open-score-3f0da'}.firebaseapp.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'open-score-3f0da',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'open-score-3f0da.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '190101745853',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messagingInstance: Messaging | null = null;

/**
 * Get Firebase Messaging instance (only in browser, not SSR)
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
    if (typeof window === 'undefined') return null;

    const supported = await isSupported();
    if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser');
        return null;
    }

    if (!messagingInstance) {
        messagingInstance = getMessaging(app);
    }
    return messagingInstance;
}

/**
 * Request browser notification permission and get FCM token.
 * Requires a VAPID key for web push.
 */
export async function requestWebPushToken(): Promise<string | null> {
    try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return null;

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('Browser notification permission denied');
            return null;
        }

        // Get the FCM token using VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
        if (!vapidKey) {
            console.error('VAPID key not configured. Generate one in Firebase Console > Cloud Messaging > Web Push certificates');
            return null;
        }

        const token = await getToken(messaging, { vapidKey });
        console.log('Web Push FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Failed to get web push token:', error);
        return null;
    }
}

/**
 * Listen for foreground messages in the browser
 */
export function onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
    if (typeof window === 'undefined') return null;

    getFirebaseMessaging().then((messaging) => {
        if (messaging) {
            onMessage(messaging, (payload) => {
                console.log('Foreground message received:', payload);
                callback(payload);
            });
        }
    });

    // Return a no-op unsubscribe since onMessage doesn't return unsubscribe in all versions
    return () => { };
}

export { app };
