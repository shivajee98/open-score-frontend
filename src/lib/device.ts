// Device identification using only Web APIs — no Capacitor plugin dependencies.
// This ensures headers are ALWAYS sent, regardless of native bridge availability.

const DEVICE_ID_KEY = 'os_device_id';

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try { return crypto.randomUUID(); } catch (_) { /* fall through */ }
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (id) return id;
    id = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
}

function parseUserAgent(): { platform: string; model: string; osVersion: string; name: string } {
    if (typeof navigator === 'undefined') {
        return { platform: 'unknown', model: 'unknown', osVersion: 'unknown', name: 'Unknown Device' };
    }
    const ua = navigator.userAgent;

    // Android: "Linux; Android 15; RMX3771 Build/AP3A..."
    const androidMatch = ua.match(/Android\s+([\d.]+);\s*([^)]+)\s+Build/);
    if (androidMatch) {
        return {
            platform: 'android',
            osVersion: androidMatch[1],
            model: androidMatch[2].trim(),
            name: androidMatch[2].trim()
        };
    }

    // iOS: "iPhone; CPU iPhone OS 17_0 like Mac OS X"
    const iosMatch = ua.match(/(iPhone|iPad|iPod).*?OS\s+([\d_]+)/);
    if (iosMatch) {
        return {
            platform: 'ios',
            osVersion: iosMatch[2].replace(/_/g, '.'),
            model: iosMatch[1],
            name: iosMatch[1]
        };
    }

    // Desktop fallback
    return {
        platform: 'web',
        osVersion: navigator.platform || 'unknown',
        model: 'browser',
        name: 'Web Browser'
    };
}

export async function getDeviceHeaders(): Promise<Record<string, string>> {
    const id = getDeviceId();
    const info = parseUserAgent();
    const fingerprint = `${info.model}-${info.platform}-${info.osVersion}`;

    return {
        'X-Device-Id': id,
        'X-Device-Name': info.name,
        'X-Device-Platform': info.platform,
        'X-Device-OS-Version': info.osVersion,
        'X-App-Version': '1.0.0',
        'X-Device-Fingerprint': fingerprint
    };
}
