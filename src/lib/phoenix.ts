import { Socket } from 'phoenix';

export const createPhoenixSocket = (token: string) => {
    const voiceUrl = process.env.NEXT_PUBLIC_VOICE_BACKEND_URL || 'wss://voice.msmeloan.sbs/socket';
    
    const socket = new Socket(voiceUrl, { params: { token } }) as any;
    
    socket.onOpen(() => console.log('[Phoenix] Connected to Voice Backend'));
    socket.onError((e: any) => console.error('[Phoenix] Connection Error', e));
    socket.onClose(() => console.log('[Phoenix] Disconnected from Voice Backend'));

    socket.connect();
    return socket;
};
