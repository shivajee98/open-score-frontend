import { Socket, Channel } from 'phoenix';
import { WebRTCEndpoint } from '@fishjam-cloud/webrtc-client';

export interface CallInfo {
    from: string;
    fromRole: string;
    roomId: string;
    fromName?: string;
    fromMobile?: string;
    offer?: any;
}

class VoiceService {
    private socket: Socket | null = null;
    private signalingChannel: Channel | null = null;
    private webrtc: WebRTCEndpoint | null = null;
    private listeners: Set<(event: string, data: any) => void> = new Set();
    private localStream: MediaStream | null = null;

    public isInitialized = false;

    async initialize(token: string) {
        if (this.isInitialized) return;

        const voiceUrl = process.env.NEXT_PUBLIC_VOICE_BACKEND_URL || 'wss://voice.msmeloan.sbs/socket';
        
        this.socket = new Socket(voiceUrl, { params: { token } });
        this.socket.connect();

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        if (!userId) {
            console.error('User ID missing for voice signaling');
            return;
        }

        this.signalingChannel = this.socket.channel(`user:${userId}`, {});
        this.signalingChannel.join()
            .receive('ok', () => {
                console.log(`Joined private signaling channel: user:${userId}`);
                this.isInitialized = true;
            })
            .receive('error', (resp: any) => console.error('Unable to join private signaling', resp));

        this.signalingChannel.on('incoming_call', (payload: any) => {
            console.log('Incoming call via Phoenix:', payload);
            this.notify('incoming_call', {
                from: payload.from,
                fromRole: payload.from_role,
                roomId: payload.room_id,
                fromName: payload.from_name,
                fromMobile: payload.from_mobile,
                offer: payload.offer
            });
        });

        // Initialize WebRTC Endpoint
        this.webrtc = new WebRTCEndpoint();
        
        this.webrtc.on('connected', (endpointId: any) => console.log('Joined room as', endpointId));
        this.webrtc.on('trackReady', (ctx: any) => {
            if (ctx.endpoint.type === 'webrtc') {
                this.notify('remote_track', ctx.track);
            }
        });

        this.isInitialized = true;
    }

    async initiateCall(targetUserId: string, roomId: string) {
        if (!this.signalingChannel) throw new Error('Signaling not initialized');
        
        return new Promise((resolve, reject) => {
            this.signalingChannel?.push('initiate_call', { to: targetUserId, room_id: roomId })
                .receive('ok', () => resolve(true))
                .receive('error', (err: any) => reject(err));
        });
    }

    async joinRoom(token: string) {
        if (!this.webrtc) throw new Error('WebRTC not initialized');
        
        // In Fishjam webrtc-client 0.25.3, we don't call connect(token) directly here if we handle signaling via Phoenix.
        // But for simplicity in this SFU setup, we'll follow the pattern where the client 
        // receives MediaEvents via signaling and feeds them to webrtc.receiveMediaEvent
        
        // However, the simplest way is to use the provided connect() if it supports the server's auth.
        // For our custom Elixir SFU, we'll manually route MediaEvents.
        
        if (this.signalingChannel) {
            this.signalingChannel.on('media_event', (payload: any) => {
                this.webrtc?.receiveMediaEvent(payload.data);
            });

            this.webrtc.on('sendMediaEvent', (event: any) => {
                this.signalingChannel?.push('media_event', { data: event });
            });
        }

        this.webrtc.connect({ name: 'User' });
    }

    async startAudio() {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (this.webrtc && this.localStream) {
            const track = this.localStream.getAudioTracks()[0];
            this.webrtc.addTrack(track, this.localStream);
        }
        return this.localStream;
    }

    stopAudio() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if (this.webrtc) {
            this.webrtc.disconnect();
        }
    }

    subscribe(callback: (event: string, data: any) => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notify(event: string, data: any) {
        this.listeners.forEach(cb => cb(event, data));
    }
}

export const voiceService = new VoiceService();
