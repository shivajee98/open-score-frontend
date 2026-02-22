'use client';

import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

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
            console.log('Initializing push notification registration...');

            // Check platform for better logging
            const platform = Capacitor.getPlatform();
            console.log(`Current platform: ${platform}`);

            let permStatus = await PushNotifications.checkPermissions();
            console.log('Initial permission status:', JSON.stringify(permStatus));

            if (permStatus.receive === 'prompt') {
                console.log('Requesting push permissions...');
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('Push notification permissions not granted:', permStatus.receive);
                toast.error('Notification access is required for real-time payment alerts.');
                return;
            }

            console.log('Permissions granted, creating notification channels...');

            // On Android, we must create a channel for notifications to show and have sound
            if (platform === 'android') {
                await PushNotifications.createChannel({
                    id: 'payment_alerts',
                    name: 'Payment Alerts',
                    description: 'Alerts for incoming payments and transactions',
                    importance: 5, // High importance
                    visibility: 1, // Public
                    sound: 'beep.wav', // Optional: if we have a custom beep in assets
                    vibration: true,
                });
                console.log('Android notification channel "payment_alerts" created');
            }

            console.log('Registering with Apple/Google...');
            await PushNotifications.register();

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', async (token) => {
                console.log('Push registration success! Token:', token.value);
                localStorage.setItem('fcm_token_temp', token.value); // Save for later sync if needed
                syncToken(token.value);
            });

            // Some error occurred
            PushNotifications.addListener('registrationError', (error: any) => {
                const errorStr = JSON.stringify(error);
                console.error('Push registration error details:', errorStr);

                if (errorStr.includes('MISSING_INSTANCEID_SERVICE')) {
                    console.error('Troubleshooting: This usually means Google Play Services are missing or outdated on the emulator/device.');
                }
                toast.error(`Push setup failed: ${error.error || 'Check Google Play Services'}`);
            });

            // Show us the notification payload if the app is open
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push received while app in foreground:', JSON.stringify(notification));
                toast.success(notification.title || 'New Notification', {
                    description: notification.body
                });
            });

            // Method called when tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                console.log('Push action performed:', JSON.stringify(action));
                // Handle navigation based on notification data
                if (action.notification.data?.path) {
                    window.location.href = action.notification.data.path;
                }
            });

            console.log('Push notification listeners attached successfully');

        } catch (e) {
            console.error('Critical notification initialization error:', e);
            toast.error('System error during notification setup');
        }
    };

    return null; // This component doesn't render anything
}
