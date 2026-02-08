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
    }, []);

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

                // Save the token to our database
                try {
                    await apiFetch('/auth/fcm-token', {
                        method: 'POST',
                        body: JSON.stringify({ token: token.value })
                    });
                    console.log('FCM Token synced with backend');
                } catch (err) {
                    console.error('Failed to sync FCM token:', err);
                }
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
