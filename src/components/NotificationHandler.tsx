'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function NotificationHandler() {
    const hasRegistered = useRef(false);

    const syncToken = useCallback(async (token: string, platform: string) => {
        try {
            await apiFetch('/auth/fcm-token', {
                method: 'POST',
                body: JSON.stringify({ token, platform })
            });
            console.log(`[Notifications] ${platform} FCM Token synced with backend`);
            localStorage.removeItem('fcm_token_temp');
            localStorage.setItem('fcm_token_synced', 'true');
        } catch (err) {
            console.error('[Notifications] Failed to sync FCM token:', err);
            // Save for retry on next auth event
            localStorage.setItem('fcm_token_temp', token);
            localStorage.setItem('fcm_token_platform', platform);
        }
    }, []);

    const registerNativePush = useCallback(async () => {
        try {
            // Dynamic import to avoid SSR issues
            const { PushNotifications } = await import('@capacitor/push-notifications');

            const platform = Capacitor.getPlatform();
            console.log(`[Notifications] Registering native push on ${platform}...`);

            let permStatus = await PushNotifications.checkPermissions();
            console.log('[Notifications] Permission status:', JSON.stringify(permStatus));

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('[Notifications] Push permissions not granted:', permStatus.receive);
                toast.error('Notification access is required for real-time alerts.');
                return;
            }

            // Create notification channel on Android
            if (platform === 'android') {
                await PushNotifications.createChannel({
                    id: 'payment_alerts',
                    name: 'Payment Alerts',
                    description: 'Alerts for incoming payments and transactions',
                    importance: 5,
                    visibility: 1,
                    sound: 'beep.wav',
                    vibration: true,
                });
                console.log('[Notifications] Android channel "payment_alerts" created');
            }

            // Register with FCM
            await PushNotifications.register();

            // Token received
            PushNotifications.addListener('registration', async (token) => {
                console.log('[Notifications] Native FCM token:', token.value);
                localStorage.setItem('fcm_token_temp', token.value);
                localStorage.setItem('fcm_token_platform', 'android');
                syncToken(token.value, 'android');
            });

            // Registration error
            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('[Notifications] Native registration error:', JSON.stringify(error));
                if (JSON.stringify(error).includes('MISSING_INSTANCEID_SERVICE')) {
                    console.error('[Notifications] Google Play Services missing or outdated');
                }
                toast.error(`Push setup failed: ${error.error || 'Check Google Play Services'}`);
            });

            // Foreground notification
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('[Notifications] Foreground push:', JSON.stringify(notification));
                toast.success(notification.title || 'New Notification', {
                    description: notification.body
                });
            });

            // Notification tapped
            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                console.log('[Notifications] Push action:', JSON.stringify(action));
                if (action.notification.data?.path) {
                    window.location.href = action.notification.data.path;
                }
            });

            console.log('[Notifications] Native push listeners attached');
        } catch (e) {
            console.error('[Notifications] Native push init error:', e);
        }
    }, [syncToken]);

    const registerWebPush = useCallback(async () => {
        try {
            // Check if browser supports notifications
            if (!('Notification' in window)) {
                console.warn('[Notifications] This browser does not support notifications');
                return;
            }

            if (!('serviceWorker' in navigator)) {
                console.warn('[Notifications] Service workers not supported');
                return;
            }

            console.log('[Notifications] Registering web push...');

            // Dynamic import to avoid SSR issues
            const { requestWebPushToken, onForegroundMessage } = await import('@/lib/firebase');

            const token = await requestWebPushToken();
            if (token) {
                localStorage.setItem('fcm_token_temp', token);
                localStorage.setItem('fcm_token_platform', 'web');
                syncToken(token, 'web');

                // Listen for foreground messages
                onForegroundMessage((payload) => {
                    console.log('[Notifications] Web foreground message:', payload);
                    const title = payload.notification?.title || 'OpenScore';
                    const body = payload.notification?.body || 'You have a new notification';
                    toast.success(title, { description: body });
                });

                console.log('[Notifications] Web push registered successfully');
            } else {
                console.warn('[Notifications] Failed to get web push token (VAPID key may be missing)');
            }
        } catch (e) {
            console.error('[Notifications] Web push init error:', e);
        }
    }, [syncToken]);

    useEffect(() => {
        if (hasRegistered.current) return;
        hasRegistered.current = true;

        // Determine platform and register accordingly
        if (Capacitor.isNativePlatform()) {
            registerNativePush();
        } else {
            // Browser - use Firebase Web Push
            registerWebPush();
        }

        // Re-sync token on login event
        const handleLogin = () => {
            const token = localStorage.getItem('fcm_token_temp');
            const platform = localStorage.getItem('fcm_token_platform') || 'unknown';
            if (token) {
                console.log('[Notifications] Login detected, syncing pending FCM token...');
                syncToken(token, platform);
            }
        };

        window.addEventListener('auth-login', handleLogin);
        return () => window.removeEventListener('auth-login', handleLogin);
    }, [registerNativePush, registerWebPush, syncToken]);

    return null;
}
