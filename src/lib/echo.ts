import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Fix for Next.js SSR
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

export const createEcho = (token?: string) => {
    const options: any = {
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'openscore_app_key',
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'api.msmeloan.sbs',
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    };

    if (token) {
        options.authEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`;
        options.auth = {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        };
    }

    return new Echo(options);
};
