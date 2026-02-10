'use client';

import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { apiFetch } from '@/lib/api';

export default function NotificationHandler() {
    useEffect(() => {
        // Only run on native platforms (Android/iOS)
        if (Capacitor.isNativePlatform()) {
            registerPush();
        }

        // Listen for login to retry sync
        const handleLogin = () => {
            const token = localStorage.getItem('fcm_token_temp');
            if (token) {
                console.log('Login detected, syncing pending FCM token...');
                syncToken(token);
            }
        };

        window.addEventListener('auth-login', handleLogin);
        return () => window.removeEventListener('auth-login', handleLogin);
    }, []);

    const syncToken = async (token: string) => {
        try {
            await apiFetch('/auth/fcm-token', {
                method: 'POST',
                body: JSON.stringify({ token })
            });
            console.log('FCM Token synced with backend');
            localStorage.removeItem('fcm_token_temp'); // Clear temp storage
        } catch (err) {
            console.error('Failed to sync FCM token:', err);
        }
    };

    const registerPush = async () => {
        try {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('Push notification permissions not granted');
                return;
            }

            await PushNotifications.register();

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', async (token) => {
                console.log('Push registration success, token:', token.value);
                localStorage.setItem('fcm_token_temp', token.value); // Save for later sync if needed
                syncToken(token.value);
            });

            // Some error occurred
            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Push registration error:', JSON.stringify(error));
            });

            // Show us the notification payload if the app is open
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push received:', notification);
                // You can use a toast or local notification here to alert the user
            });

            // Method called when tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                console.log('Push action performed:', notification);
                // Handle navigation based on notification data
            });

        } catch (e) {
            console.error('Notification logic error:', e);
        }
    };

    return null; // This component doesn't render anything
}
