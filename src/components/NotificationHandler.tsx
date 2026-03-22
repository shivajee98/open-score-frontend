'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function NotificationHandler() {
    const router = useRouter();
    const hasRegistered = useRef(false);
    const hasNativePushSupport = () => Capacitor.isPluginAvailable('PushNotifications');

    /**
     * Sync FCM token to backend.
     * Waits for auth token to be available before sending.
     */
    const syncToken = useCallback(async (token: string, platform: string) => {
        // Check if auth token exists — if not, save for later
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            console.log('[Notifications] No auth token yet, saving FCM token for later sync');
            localStorage.setItem('fcm_token_temp', token);
            localStorage.setItem('fcm_token_platform', platform);
            return;
        }

        try {
            await apiFetch('/auth/fcm-token', {
                method: 'POST',
                body: JSON.stringify({ token, platform })
            });
            console.log(`[Notifications] ${platform} FCM Token synced with backend ✅`);
            localStorage.removeItem('fcm_token_temp');
            localStorage.removeItem('fcm_token_platform');
            localStorage.setItem('fcm_token_synced', 'true');
        } catch (err) {
            console.error('[Notifications] Failed to sync FCM token:', err);
            // Save for retry
            localStorage.setItem('fcm_token_temp', token);
            localStorage.setItem('fcm_token_platform', platform);
        }
    }, []);

    const registerNativePush = useCallback(async () => {
        try {
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

            // Request permissions for Android 13+
            let perm = await PushNotifications.checkPermissions();
            console.log('[Notifications] Current permission status:', perm.receive);

            if (perm.receive === 'prompt') {
                perm = await PushNotifications.requestPermissions();
                console.log('[Notifications] Permission request result:', perm.receive);
            }

            if (perm.receive !== 'granted') {
                console.warn('[Notifications] Push permissions not granted:', perm.receive);
                return;
            }

            // Create notification channel on Android (required for foreground notifications)
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

            console.log('[Notifications] Native push registered via registerNativePush()');
        } catch (e) {
            console.error('[Notifications] Native push init error:', e);
        }
    }, [syncToken]);

    const registerWebPush = useCallback(async () => {
        try {
            if (!('Notification' in window)) {
                console.warn('[Notifications] This browser does not support notifications');
                return;
            }

            if (!('serviceWorker' in navigator)) {
                console.warn('[Notifications] Service workers not supported');
                return;
            }

            console.log('[Notifications] Registering web push...');

            const { requestWebPushToken, onForegroundMessage } = await import('@/lib/firebase');

            const token = await requestWebPushToken();
            if (token) {
                localStorage.setItem('fcm_token_temp', token);
                localStorage.setItem('fcm_token_platform', 'web');
                syncToken(token, 'web');

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

        const isNative = hasNativePushSupport();

        // ONLY attach native listeners if on a native platform
        if (isNative) {
            import('@capacitor/push-notifications').then(({ PushNotifications }) => {
                PushNotifications.addListener('registration', async (tokenResult) => {
                    console.log('[Notifications] registration event:', tokenResult);
                    if (!tokenResult.value) {
                        console.warn('[Notifications] FCM token is null! Full event:', tokenResult);
                        toast.error('Push registration failed: FCM token is null');
                        return;
                    }
                    console.log('[Notifications] Native FCM token received:', tokenResult.value.substring(0, 20) + '...');
                    localStorage.setItem('fcm_token_temp', tokenResult.value);
                    localStorage.setItem('fcm_token_platform', 'android');
                    syncToken(tokenResult.value, 'android');
                });

                PushNotifications.addListener('registrationError', (error) => {
                    console.error('[Notifications] Native registration error:', JSON.stringify(error));
                    toast.error(`Push setup failed: ${error.error || 'Check Google Play Services'}`);
                });

                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    console.log('[Notifications] Foreground push:', JSON.stringify(notification));
                    toast.success(notification.title || 'New Notification', {
                        description: notification.body
                    });
                });

                PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                    console.log('[Notifications] Push action:', JSON.stringify(action));
                    const data = action.notification.data;
                    const targetPath = data?.path || data?.url || data?.link;

                    if (targetPath) {
                        console.log('[Notifications] Redirecting to:', targetPath);
                        if (targetPath.startsWith('/') || targetPath.includes(window.location.host)) {
                            const pathOnly = targetPath.startsWith('http') 
                                ? new URL(targetPath).pathname + new URL(targetPath).search 
                                : targetPath;
                            router.push(pathOnly);
                        } else {
                            window.location.href = targetPath;
                        }
                    }
                });

                // Also call the native registration function
                registerNativePush();
            });
        } else {
            // Register Web Push if on web
            registerWebPush();
        }

        /**
         * CRITICAL: Re-sync token on login event.
         */
        const handleLogin = () => {
            const token = localStorage.getItem('fcm_token_temp');
            const platform = localStorage.getItem('fcm_token_platform') || 'unknown';
            if (token) {
                console.log('[Notifications] Login/auth event detected, syncing pending FCM token...');
                syncToken(token, platform);
            }
        };

        window.addEventListener('auth-login', handleLogin);

        // ALSO: Try to sync immediately if the user is already logged in
        // This covers the fast-path redirect case where auth-login is never dispatched
        const authToken = localStorage.getItem('token');
        const pendingFcmToken = localStorage.getItem('fcm_token_temp');
        if (authToken && pendingFcmToken) {
            console.log('[Notifications] User already logged in with pending FCM token, syncing now...');
            const platform = localStorage.getItem('fcm_token_platform') || 'unknown';
            // Small delay to ensure all components have mounted
            setTimeout(() => syncToken(pendingFcmToken, platform), 2000);
        }

        // Periodic retry: if token still not synced after 10 seconds, try again
        const retryTimer = setTimeout(() => {
            const token = localStorage.getItem('fcm_token_temp');
            const synced = localStorage.getItem('fcm_token_synced');
            if (token && !synced) {
                console.log('[Notifications] Retry: Attempting to sync FCM token...');
                const platform = localStorage.getItem('fcm_token_platform') || 'unknown';
                syncToken(token, platform);
            }
        }, 10000);

        return () => {
            window.removeEventListener('auth-login', handleLogin);
            clearTimeout(retryTimer);
        };
    }, [registerNativePush, registerWebPush, syncToken]);

    return null;
}
