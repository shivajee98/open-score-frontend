'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, RotateCw, Check, X, MapPin, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/heic-utils';

interface CameraProps {
    onCapture: (blob: Blob) => void | Promise<void>;
    label: string;
}

export default function Camera({ onCapture, label }: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAligned, setIsAligned] = useState(false);

    const startCamera = async () => {
        try {
            setError(null);
            setIsAligned(false);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            // Allow capture after a very brief delay for the stream to stabilize
            setTimeout(() => {
                setIsAligned(true);
            }, 500);
        } catch (err: any) {
            console.error("Camera access error:", err);
            setError(err.name === 'NotAllowedError' ? "Camera access denied. Please enable permissions in your browser settings." : "Could not start camera. Please try the Gallery upload instead.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capture = () => {
        if (!videoRef.current || !isAligned) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const confirmCapture = async () => {
        if (!capturedImage) return;
        setLoading(true);
        try {
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            await onCapture(blob);
        } catch (err) {
            console.error("Capture confirmation error:", err);
            setError("Failed to process captured image.");
        } finally {
            setLoading(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const processedFile = await convertHeicToJpeg(file);

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            const isImage = allowedTypes.includes(processedFile.type) || allowedExtensions.some(ext => processedFile.name.toLowerCase().endsWith(ext));

            if (!isImage) {
                alert("Format not supported. Use JPEG, PNG, HEIC, or WebP.");
                setLoading(false);
                return;
            }

            await onCapture(processedFile);
        } catch (err) {
            console.error("Gallery upload error:", err);
            setError("Error processing image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div className="flex flex-col gap-4 relative">
            <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">{label}</p>

            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                {!capturedImage ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={cn(
                                "w-[85%] h-[70%] border-2 rounded-2xl transition-all duration-500",
                                isAligned ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "border-white/30 border-dashed"
                            )} />
                        </div>
                        <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300",
                                isAligned ? "bg-emerald-500 text-white" : "bg-white/20 text-white"
                            )}>
                                {isAligned ? "Scanning Ready" : "Align Document"}
                            </span>
                        </div>
                    </>
                ) : (
                    <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                )}
            </div>

            <div className="flex justify-center gap-4">
                {!capturedImage ? (
                    <div className="flex items-center gap-6">
                        <label className="w-14 h-14 rounded-full bg-slate-100 flex flex-col items-center justify-center text-slate-600 shadow-lg active:scale-95 transition-all cursor-pointer">
                            <Upload size={20} />
                            <span className="text-[8px] font-black uppercase mt-1">Gallery</span>
                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" onChange={handleGalleryUpload} />
                        </label>

                        <button
                            onClick={capture}
                            disabled={!isAligned}
                            className={cn(
                                "w-20 h-20 rounded-full border-8 flex items-center justify-center shadow-xl transition-all",
                                isAligned ? "bg-blue-600 border-blue-100 active:scale-90" : "bg-slate-300 border-slate-200 cursor-not-allowed opacity-50"
                            )}
                        >
                            <CameraIcon className="text-white w-8 h-8" />
                        </button>

                        <div className="w-14" /> {/* Spacer */}
                    </div>
                ) : (
                    <>
                        <button
                            onClick={retake}
                            className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shadow-lg active:scale-95 transition-all"
                        >
                            <RotateCw size={24} />
                        </button>
                        <button
                            onClick={confirmCapture}
                            disabled={loading}
                            className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" /> : <Check size={28} />}
                        </button>
                    </>
                )}
            </div>

            {error && <p className="text-rose-500 text-xs text-center font-bold px-4">{error}</p>}

            {/* Local Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl overflow-hidden animate-in fade-in duration-300">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest mt-4">Processing...</span>
                </div>
            )}
        </div>
    );
}
