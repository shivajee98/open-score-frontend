"use client";

import { useState, useEffect, useRef } from 'react';
import { voiceService, CallInfo } from '@/lib/VoiceService';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export default function IncomingCallModal() {
    const [incomingCall, setIncomingCall] = useState<CallInfo | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'incoming' | 'connected' | 'ended'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Initialize voice service for global signaling
        voiceService.initialize(token);

        const unsubscribe = voiceService.subscribe((event, data) => {
            if (event === 'incoming_call') {
                setIncomingCall(data);
                setCallStatus('incoming');
                playRingtone();
            } else if (event === 'remote_track') {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = new MediaStream([data]);
                    remoteAudioRef.current.play().catch(e => console.error("Auto-play failed", e));
                }
            }
        });

        return () => {
            unsubscribe();
            voiceService.stopAudio();
        };
    }, []);

    const playRingtone = () => {
        // Optional: play sound
    };

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const acceptCall = async () => {
        if (!incomingCall) return;

        try {
            await voiceService.startAudio();
            await voiceService.joinRoom(localStorage.getItem('token') || '');

            setCallStatus('connected');
            startTimer();
        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to access microphone');
            endCall();
        }
    };

    const endCall = () => {
        voiceService.stopAudio();
        if (timerRef.current) clearInterval(timerRef.current);

        setIncomingCall(null);
        setCallStatus('idle');
        setCallDuration(0);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        // Toggle logic can be added to voiceService
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (callStatus === 'idle') return (
        <audio ref={remoteAudioRef} autoPlay />
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden text-center">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-white -z-10"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner border-4 border-white">
                        <Phone size={40} className="text-blue-600 animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {incomingCall?.fromRole === 'SUPPORT' ? 'Support Agent' : 'Agent Call'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        {callStatus === 'incoming' ? 'Incoming Voice Call...' : 'Connected'}
                    </p>

                    {callStatus === 'connected' && (
                        <p className="text-3xl font-mono font-bold text-slate-800 mb-8">{formatTime(callDuration)}</p>
                    )}

                    <div className="flex justify-center gap-6 items-center">
                        {callStatus === 'incoming' ? (
                            <>
                                <button
                                    onClick={endCall}
                                    className="p-5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-all active:scale-95"
                                >
                                    <PhoneOff size={28} />
                                </button>
                                <button
                                    onClick={acceptCall}
                                    className="p-5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/30 animate-bounce"
                                >
                                    <Phone size={28} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleMute}
                                    className={`p-4 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-800'}`}
                                >
                                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>

                                <button
                                    onClick={endCall}
                                    className="p-4 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-500/30"
                                >
                                    <PhoneOff size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hidden Audio Elements */}
                <audio ref={remoteAudioRef} autoPlay />
            </div>
        </div>
    );
}
