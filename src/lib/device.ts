import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

const DEVICE_ID_KEY = 'os_device_id';

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Safe standard fallback for environments without crypto.randomUUID (e.g. non-HTTPS, old webviews)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function getDeviceId(): Promise<string> {
    const { value } = await Preferences.get({ key: DEVICE_ID_KEY });
    if (value) return value;

    const newId = generateUUID();
    await Preferences.set({ key: DEVICE_ID_KEY, value: newId });
    return newId;
}

export async function getDeviceMetadata() {
    const info = await Device.getInfo();
    const battery = await Device.getBatteryInfo();
    const id = await getDeviceId();

    return {
        id,
        name: info.name || 'Unknown Device',
        platform: info.platform,
        osVersion: info.osVersion,
        appVersion: '1.0.0', // This could be fetched from package.json or config
        model: info.model,
        manufacturer: info.manufacturer,
        fingerprint: `${info.model}-${info.platform}-${info.osVersion}` // Simple fingerprint
    };
}

export async function getDeviceHeaders() {
    const meta = await getDeviceMetadata();
    return {
        'X-Device-Id': meta.id,
        'X-Device-Name': meta.name,
        'X-Device-Platform': meta.platform,
        'X-Device-OS-Version': meta.osVersion,
        'X-App-Version': meta.appVersion,
        'X-Device-Fingerprint': meta.fingerprint
    };
}
