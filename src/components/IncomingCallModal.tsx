"use client";

import { useState, useEffect, useRef } from 'react';
import { createEcho } from '@/lib/echo';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.msmeloan.sbs/api';

export default function IncomingCallModal() {
    const [incomingCall, setIncomingCall] = useState<{ offer: any, caller: any } | null>(null);
    const [callStatus, setCallStatus] = useState<'idle' | 'incoming' | 'connected' | 'ended'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const localAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const echoRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only connect if user is logged in
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) return;

        const user = JSON.parse(userStr);
        const userId = user.id;

        // Initialize Echo
        const echo = createEcho(token);
        echoRef.current = echo;

        console.log(`Listening on private-App.Models.User.${userId}`);

        // Listen for Incoming Call
        echo.private(`App.Models.User.${userId}`)
            .listen('.IncomingCall', (e: any) => {
                console.log('Incoming Call:', e);
                setIncomingCall({ offer: e.offer, caller: e.caller });
                setCallStatus('incoming');
                playRingtone();
            })
            .listen('.IceCandidate', async (e: any) => {
                console.log('ICE Candidate received:', e);
                if (peerConnection.current) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(e.candidate));
                }
            })
            .listen('.EndCall', () => {
                console.log('Call Ended by peer');
                toast.info('Call ended');
                endCall(false);
            });

        return () => {
            if (echoRef.current) {
                echoRef.current.leave(`App.Models.User.${userId}`);
            }
        };
    }, []);

    const playRingtone = () => {
        // Optional: Play a ringtone sound
        // const audio = new Audio('/sounds/ringtone.mp3');
        // audio.play();
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (localAudioRef.current) localAudioRef.current.srcObject = stream;

            // Create Peer Connection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                ]
            });

            // Add local tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // Handle remote tracks
            pc.ontrack = (event) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                    // Ensure audio plays
                    remoteAudioRef.current.play().catch(e => console.error("Auto-play failed", e));
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const token = localStorage.getItem('token');
                    fetch(`${API_URL}/call/ice-candidate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            candidate: event.candidate,
                            to: incomingCall.caller.id
                        })
                    });
                }
            };

            peerConnection.current = pc;

            // Set Remote Description (Offer)
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

            // Create Answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send Answer
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/call/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    answer,
                    to: incomingCall.caller.id
                })
            });

            setCallStatus('connected');
            startTimer();

        } catch (error) {
            console.error('Error accepting call:', error);
            toast.error('Failed to access microphone');
            endCall(true);
        }
    };

    const endCall = async (notifyPeer = true) => {
        if (notifyPeer && callStatus === 'connected' && incomingCall) {
            const token = localStorage.getItem('token');
            try {
                await fetch(`${API_URL}/call/end`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ to: incomingCall.caller.id })
                });
            } catch (e) { console.error(e); }
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop local stream
        if (localAudioRef.current && localAudioRef.current.srcObject) {
            const stream = localAudioRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        if (timerRef.current) clearInterval(timerRef.current);

        setIncomingCall(null);
        setCallStatus('idle');
        setCallDuration(0);
    };

    const toggleMute = () => {
        if (localAudioRef.current && localAudioRef.current.srcObject) {
            const stream = localAudioRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (callStatus === 'idle') return (
        <>
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative overflow-hidden text-center">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-white -z-10"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner border-4 border-white animate-bounce-slow">
                        <Phone size={40} className="text-blue-600" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {incomingCall?.caller?.name || 'Support Agent'}
                    </h3>
                    <p className="text-slate-500 font-medium mb-8">
                        {callStatus === 'incoming' ? 'Incoming Support Call...' : 'Connected'}
                    </p>

                    {callStatus === 'connected' && (
                        <p className="text-3xl font-mono font-bold text-slate-800 mb-8">{formatTime(callDuration)}</p>
                    )}

                    <div className="flex justify-center gap-6 items-center">
                        {callStatus === 'incoming' ? (
                            <>
                                <button
                                    onClick={() => endCall(true)} // Reject is same as end
                                    className="p-5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-all active:scale-95"
                                >
                                    <PhoneOff size={28} />
                                </button>
                                <button
                                    onClick={acceptCall}
                                    className="p-5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/30 animate-pulse"
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
                                    onClick={() => endCall(true)}
                                    className="p-4 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all active:scale-95 shadow-xl shadow-rose-500/30"
                                >
                                    <PhoneOff size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Hidden Audio Elements - kept in render to ensure refs persist */}
                <audio ref={localAudioRef} autoPlay muted />
                <audio ref={remoteAudioRef} autoPlay />
            </div>
        </div>
    );
}
