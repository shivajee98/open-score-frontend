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
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex items-center justify-between z-30">
                <div className="flex flex-col">
                    <h2 className="text-white text-lg font-black uppercase tracking-[0.2em]">{label}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <MapPin size={10} className="text-blue-500" /> Auto-detection active
                    </p>
                </div>
                <button 
                    onClick={() => { stopCamera(); onCapture(new Blob(), 'CLOSE'); }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
                {!capturedImage ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        
                        {/* Immersive Viewfinder */}
                        <div className="relative w-[90%] aspect-[3/2] z-10 pointer-events-none">
                            {/* Corner brackets */}
                            <div className={cn(
                                "absolute inset-0 border-2 transition-all duration-700",
                                isAligned ? "border-blue-500 opacity-100" : "border-white/20 border-dashed opacity-50"
                            )}>
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -translate-x-1 -translate-y-1 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 translate-x-1 -translate-y-1 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -translate-x-1 translate-y-1 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 translate-x-1 translate-y-1 rounded-br-xl" />
                                
                                {/* Scan line */}
                                <div className={cn(
                                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)]",
                                    isAligned ? "animate-[scanLine_2s_ease-in-out_infinite]" : "hidden"
                                )} />
                            </div>

                            {/* Help Text */}
                            <div className="absolute -bottom-16 left-0 right-0 text-center">
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    isAligned ? "text-blue-400 opacity-100" : "text-white/40"
                                )}>
                                    {isAligned ? "Document Detected • Ready" : "Align document within frame"}
                                </p>
                            </div>
                        </div>

                        {/* Background tint */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
                    </div>
                ) : showCropper && imageDimensions ? (
                    <div className="absolute inset-0 z-20 bg-slate-50 overflow-auto">
                        <DocumentCropper
                            imageSrc={capturedImage}
                            initialCorners={cornersData}
                            imageWidth={imageDimensions.w}
                            imageHeight={imageDimensions.h}
                            onConfirm={confirmCrop}
                            onCancel={retake}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                        <img src={capturedImage} className="max-w-full max-h-full object-contain" alt="Captured" />
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            {!showCropper && (
                <div className="px-8 pb-12 pt-8 bg-gradient-to-t from-black to-transparent z-30">
                    {!capturedImage ? (
                        <div className="flex items-center justify-between">
                            <label className="group flex flex-col items-center gap-2 cursor-pointer transition-all">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors">
                                    <Upload size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Gallery</span>
                                <input type="file" className="hidden" accept="image/jpeg,image/png,image/heic,image/heif,image/webp" onChange={handleGalleryUpload} />
                            </label>

                            <button
                                onClick={capture}
                                disabled={!isAligned}
                                className={cn(
                                    "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                                    isAligned 
                                        ? "bg-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90" 
                                        : "bg-white/20 cursor-not-allowed grayscale"
                                )}
                            >
                                <div className="w-[85%] h-[85%] rounded-full border-2 border-black/10" />
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500/0 active:border-blue-500/50 transition-all" />
                            </button>

                            <div className="w-12 h-12 invisible" /> {/* Placeholder for symmetry */}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={retake}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-colors shadow-lg">
                                    <RotateCw size={24} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Retake</span>
                            </button>
                            
                            <button
                                onClick={confirmCapture}
                                disabled={loading}
                                className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.5)] active:scale-90 transition-all"
                            >
                                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={32} strokeWidth={3} />}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Processing Overlay */}
            {loading && (
                <div className="absolute inset-0 z-[3000] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <div className="relative w-24 h-32 mb-8">
                        <div className="absolute inset-0 bg-white/5 rounded-xl border-2 border-white/10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-[scanLine_1.5s_ease-in-out_infinite]" />
                            <div className="p-4 space-y-3 pt-8">
                                <div className="h-1.5 bg-white/10 rounded-full w-full" />
                                <div className="h-1.5 bg-white/10 rounded-full w-4/5" />
                                <div className="h-1.5 bg-white/10 rounded-full w-full" />
                                <div className="h-1.5 bg-white/10 rounded-full w-3/5" />
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Shield className="text-white" size={20} />
                        </div>
                    </div>

                    <h3 className="text-white text-sm font-black uppercase tracking-[0.3em] mb-1">Processing</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Optimizing identity scan</p>

                    <div className="mt-8 flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scanLine {
                    0%, 100% { top: 10%; opacity: 0; }
                    50% { top: 90%; opacity: 1; }
                }
            `}</style>
        </div>
    );
}
