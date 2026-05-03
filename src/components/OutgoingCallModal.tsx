"use client";

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { createPhoenixSocket } from '@/lib/phoenix';
import { Socket, Channel } from 'phoenix';

interface CallSession {
    id: number;
    channel_name: string;
    status: string;
    agent_id?: number;
}

interface OutgoingCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

export default function OutgoingCallModal({ isOpen, onClose, userId }: OutgoingCallModalProps) {
    const [callStatus, setCallStatus] = useState<'initiating' | 'ringing' | 'connected' | 'failed' | 'ended'>('initiating');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [session, setSession] = useState<CallSession | null>(null);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const signalingChannelRef = useRef<Channel | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        let isCleanedUp = false;
        
        const initiateCall = async () => {
            try {
                // 1. Get Microphone access (non-fatal - call can still be initiated)
                try {
                    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (localAudioRef.current) {
                        localAudioRef.current.srcObject = localStream.current;
                    }
                } catch (micError: any) {
                    console.warn('Microphone access failed, proceeding without local audio:', micError.message);
                }

                // 2. Initialize WebRTC
                peerConnection.current = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });

                if (localStream.current) {
                    localStream.current.getTracks().forEach(track => {
                        peerConnection.current?.addTrack(track, localStream.current!);
                    });
                }

                peerConnection.current.ontrack = (event) => {
                    if (remoteAudioRef.current && event.streams[0]) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };

                // 3. Create Offer
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);

                // 4. Initiate call via Backend
                const response = await apiFetch('/call/initiate', { 
                    method: 'POST',
                    body: JSON.stringify({ offer })
                });
                
                if (isCleanedUp) return;

                setSession({ id: response.call_id, channel_name: '', status: 'ringing' });
                setCallStatus('ringing');
                toast.success(`Calling ${response.agent_name}...`);

                // 5. Listen for Signaling via Phoenix
                const token = localStorage.getItem('token');
                if (!token) throw new Error('Auth token missing');
                
                const socket = createPhoenixSocket(token);
                socketRef.current = socket;
                
                const channel = socket.channel(`user:${userId}`, {});
                signalingChannelRef.current = channel;

                channel.join()
                    .receive("ok", () => console.log("Joined Phoenix signaling"))
                    .receive("error", (e: any) => console.error("Phoenix join error", e));
                
                const iceBuffer: RTCIceCandidateInit[] = [];
                
                channel.on('call_accepted', async (e: any) => {
                    console.log('Call answered via Phoenix:', e);
                    setCallStatus('connected');
                    startTimer();
                });

                channel.on('media_event', async (payload: any) => {
                    const e = payload.data;
                    console.log('Media event via Phoenix:', e.type || 'ICE');
                    
                    if (e.type === 'answer' && peerConnection.current) {
                        try {
                            const rawSdp = e.sdp;
                            const sanitizedSdp = rawSdp
                                .replace(/\\r\\n/g, '\n')
                                .replace(/\\n/g, '\n')
                                .split('\n')
                                .map((line: string) => line.trim())
                                .filter((line: string) => line.length > 0)
                                .join('\r\n') + '\r\n';

                            await peerConnection.current.setRemoteDescription(new RTCSessionDescription({
                                type: e.type,
                                sdp: sanitizedSdp
                            }));

                            // Process buffered candidates
                            while (iceBuffer.length > 0) {
                                const cand = iceBuffer.shift();
                                if (cand) await peerConnection.current.addIceCandidate(new RTCIceCandidate(cand));
                            }
                        } catch (err) {
                            console.error('Failed to set remote description:', err);
                        }
                    } else if (e.candidate) {
                        if (peerConnection.current?.remoteDescription) {
                            await peerConnection.current.addIceCandidate(new RTCIceCandidate(e.candidate));
                        } else {
                            iceBuffer.push(e.candidate);
                        }
                    }
                });

                channel.on('call_ended', () => {
                    handleCallEnd(false);
                });

                // 6. Notify Elixir of new call
                channel.push('initiate_call', { 
                    to: response.agent_id, 
                    room_id: response.call_id,
                    offer: offer,
                    from_name: localStorage.getItem('user_name') || 'Customer',
                    from_mobile: localStorage.getItem('user_mobile') || ''
                });

                peerConnection.current.onicecandidate = async (event) => {
                    if (event.candidate && response.agent_id && signalingChannelRef.current) {
                        signalingChannelRef.current.push('media_event', { 
                            to: response.agent_id, 
                            data: { candidate: event.candidate } 
                        });
                    }
                };

            } catch (error: any) {
                console.error('Call initiation failed:', error);
                if (error.message) toast.error(error.message);
                else toast.error('No agents available in your area');
                setCallStatus('failed');
                setTimeout(() => handleCallEnd(false), 3000);
            }
        };

        initiateCall();

        return () => {
            isCleanedUp = true;
            cleanupCall();
        };
    }, [isOpen]);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    };

    const cleanupCall = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        localStream.current?.getTracks().forEach(t => t.stop());
        peerConnection.current?.close();
        if (socketRef.current) {
            (socketRef.current as any).disconnect();
        }
    };

    const handleCallEnd = async (notifyBackend = true) => {
        if (notifyBackend && session) {
            try {
                await apiFetch(`/call/${session.id}/end`, { method: 'POST' });
            } catch (e) {
                console.error(e);
            }
        }
        setCallStatus('ended');
        cleanupCall();
        setTimeout(onClose, 1500);
    };

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(t => {
                t.enabled = isMuted; // if it was muted, enable it
            });
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/90 z-[9999] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300 backdrop-blur-md">
            {/* Background Animations */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-1000 -z-10 ${
                callStatus === 'ringing' ? 'bg-indigo-500/30 animate-pulse' :
                callStatus === 'connected' ? 'bg-emerald-500/20 animate-pulse' :
                callStatus === 'failed' ? 'bg-rose-500/30' : 'bg-transparent'
            }`}></div>

            <div className="flex flex-col items-center w-full max-w-sm">
                <div className="relative mb-10">
                    <div className={`w-32 h-32 rounded-full border-2 p-2 flex items-center justify-center shadow-2xl relative overflow-hidden bg-slate-900 ${
                        callStatus === 'ringing' ? 'border-indigo-500/50' :
                        callStatus === 'connected' ? 'border-emerald-500/50' : 'border-slate-800'
                    }`}>
                        <Phone className={`w-12 h-12 ${
                            callStatus === 'ringing' ? 'text-indigo-400 animate-bounce' :
                            callStatus === 'connected' ? 'text-emerald-400' :
                            callStatus === 'failed' ? 'text-rose-400' : 'text-slate-500'
                        }`} />
                        
                        {/* Ripple Effect */}
                        {callStatus === 'ringing' && (
                            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping"></div>
                        )}
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Support Agent</h2>
                
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 h-6 flex items-center justify-center">
                    {callStatus === 'initiating' && 'Connecting...'}
                    {callStatus === 'ringing' && 'Ringing...'}
                    {callStatus === 'connected' && <span className="text-emerald-400">{formatTime(callDuration)}</span>}
                    {callStatus === 'failed' && <span className="text-rose-400">Call Failed</span>}
                    {callStatus === 'ended' && 'Call Ended'}
                </p>

                {callStatus === 'connected' && (
                    <div className="grid grid-cols-2 gap-6 mb-12 w-full px-8">
                        <button 
                            onClick={toggleMute}
                            className={`flex flex-col items-center gap-3 group transition-all active:scale-95`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                                isMuted ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-slate-800/50 text-white border-slate-700 hover:bg-slate-800'
                            }`}>
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mute</span>
                        </button>

                        <button 
                            onClick={() => setIsSpeaker(!isSpeaker)}
                            className={`flex flex-col items-center gap-3 group transition-all active:scale-95`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                                isSpeaker ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-slate-800/50 text-white border-slate-700 hover:bg-slate-800'
                            }`}>
                                {isSpeaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speaker</span>
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => handleCallEnd(true)}
                    className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:bg-rose-600 transition-all active:scale-90 border-4 border-rose-400"
                >
                    <PhoneOff size={32} />
                </button>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-4">End Call</p>

                {/* Hidden Audio Elements */}
                <audio ref={localAudioRef} autoPlay muted />
                <audio ref={remoteAudioRef} autoPlay />
            </div>
        </div>
    );
}
