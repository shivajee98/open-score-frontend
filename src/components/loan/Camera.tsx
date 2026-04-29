'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, RotateCw, Check, X, MapPin, Image as ImageIcon, Upload, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertHeicToJpeg } from '@/lib/heic-utils';
import { apiFetch } from '@/lib/api';
import DocumentCropper from './DocumentCropper';

interface CameraProps {
    onCapture: (blob: Blob, corners?: string) => void | Promise<void>;
    label: string;
}

export default function Camera({ onCapture, label }: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAligned, setIsAligned] = useState(false);

    // Auto-cropping states
    const [cornersData, setCornersData] = useState<number[][] | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{w: number, h: number} | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

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
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        
        // Cap resolution to 2000px max dimension
        let width = video.videoWidth;
        let height = video.videoHeight;
        const maxDim = 2000;
        
        if (width > maxDim || height > maxDim) {
            if (width > height) {
                height = (maxDim / width) * height;
                width = maxDim;
            } else {
                width = (maxDim / height) * width;
                height = maxDim;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) processImageAndDetect(blob);
            }, 'image/jpeg', 0.8);
        }
    };

    const processImageAndDetect = async (blob: Blob) => {
        setLoading(true);
        const objectUrl = URL.createObjectURL(blob);
        
        // Get natural dimensions
        const img = new window.Image();
        img.src = objectUrl;
        await new Promise((resolve) => { img.onload = resolve; });
        setImageDimensions({ w: img.width, h: img.height });
        
        // Attempt detection
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');
        try {
            const apiData = await apiFetch('/kyc/detect-corners', { method: 'POST', body: formData });
            if (apiData && apiData.corners) {
                setCornersData(apiData.corners);
            } else {
                setCornersData(null);
            }
        } catch(e) {
            console.error("Corner detection failed", e);
            setCornersData(null);
        }

        setCapturedImage(objectUrl);
        setCapturedBlob(blob);
        setShowCropper(true);
        setLoading(false);
        stopCamera();
    };

    const confirmCrop = async (cornersStr: string) => {
        if (!capturedBlob) return;
        setLoading(true);
        try {
            await onCapture(capturedBlob, cornersStr);
        } catch (err) {
            console.error("Capture confirmation error:", err);
            setError("Failed to process captured image.");
        } finally {
            setLoading(false);
        }
    };

    const confirmCapture = () => confirmCrop('[]');

    const resizeImage = (file: File, maxDim: number = 2000): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = (maxDim / width) * height;
                            width = maxDim;
                        } else {
                            width = (maxDim / height) * width;
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(resizedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            let processedFile = await convertHeicToJpeg(file);

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            const isImage = allowedTypes.includes(processedFile.type) || allowedExtensions.some(ext => processedFile.name.toLowerCase().endsWith(ext));

            if (!isImage) {
                alert("Format not supported. Use JPEG, PNG, HEIC, or WebP.");
                setLoading(false);
                return;
            }

            // Resize the image before sending it to the parent
            processedFile = await resizeImage(processedFile);

            await processImageAndDetect(processedFile);
        } catch (err) {
            console.error("Gallery upload error:", err);
            setError("Error processing image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setCapturedBlob(null);
        setShowCropper(false);
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
                            </span>
                        </div>
                    </>
                ) : showCropper && imageDimensions ? (
                    <DocumentCropper
                        imageSrc={capturedImage}
                        initialCorners={cornersData}
                        imageWidth={imageDimensions.w}
                        imageHeight={imageDimensions.h}
                        onConfirm={confirmCrop}
                        onCancel={retake}
                    />
                ) : (
                    <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                )}
            </div>

            {!showCropper && (
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
            )}

            {error && <p className="text-rose-500 text-xs text-center font-bold px-4">{error}</p>}

            {/* Local Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl overflow-hidden animate-in fade-in duration-300">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                        <div className="absolute inset-2 border-2 border-blue-400/10 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="text-blue-500/40 animate-pulse" size={32} />
                        </div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2">Analyzing Image</span>
                    <div className="flex gap-1.5">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>

                    <style jsx>{`
                        @keyframes scan {
                            0%, 100% { top: 0%; opacity: 0; }
                            50% { top: 100%; opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
