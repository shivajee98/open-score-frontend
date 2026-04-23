import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

const DEVICE_ID_KEY = 'os_device_id';

export async function getDeviceId(): Promise<string> {
    const { value } = await Preferences.get({ key: DEVICE_ID_KEY });
    if (value) return value;

    const newId = crypto.randomUUID();
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
