'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Corners are in format [[x,y], [x,y], [x,y], [x,y]] relative to the ACTUAL image width/height.
interface DocumentCropperProps {
    imageSrc: string;
    initialCorners: number[][] | null;
    imageWidth: number;
    imageHeight: number;
    onConfirm: (corners: string) => void;
    onCancel: () => void;
}

export default function DocumentCropper({
    imageSrc,
    initialCorners,
    imageWidth,
    imageHeight,
    onConfirm,
    onCancel
}: DocumentCropperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [corners, setCorners] = useState<number[][]>(() => {
        if (initialCorners && initialCorners.length === 4) return initialCorners;
        // Default to a 10% margin if no corners found
        const marginX = imageWidth * 0.1;
        const marginY = imageHeight * 0.1;
        return [
            [marginX, marginY],
            [imageWidth - marginX, marginY],
            [imageWidth - marginX, imageHeight - marginY],
            [marginX, imageHeight - marginY]
        ];
    });

    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

    // Order points helper
    const orderPoints = (pts: number[][]) => {
        const rect = [...pts];
        rect.sort((a, b) => a[1] - b[1]); // Sort by y

        const top = rect.slice(0, 2).sort((a, b) => a[0] - b[0]);
        const bottom = rect.slice(2, 4).sort((a, b) => b[0] - a[0]);

        return [...top, ...bottom];
    };

    const handlePointerDown = (index: number) => {
        setDraggingIdx(index);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (draggingIdx === null || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        let x = clientX - rect.left;
        let y = clientY - rect.top;

        // Clamp to container
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        // Convert back to image coordinates
        const scaleX = imageWidth / rect.width;
        const scaleY = imageHeight / rect.height;

        const imgX = x * scaleX;
        const imgY = y * scaleY;

        setCorners(prev => {
            const next = [...prev];
            next[draggingIdx] = [imgX, imgY];
            return next;
        });
    };

    const handlePointerUp = () => {
        if (draggingIdx !== null) {
            setCorners(prev => orderPoints(prev));
            setDraggingIdx(null);
        }
    };

    const submit = () => {
        onConfirm(JSON.stringify(corners));
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full animate-in fade-in duration-300">
            <div className="text-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Adjust Corners</h3>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Drag dots to match document edges</p>
            </div>

            <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex-1 touch-none select-none">
                <div 
                    ref={containerRef}
                    className="relative w-full h-full flex items-center justify-center cursor-crosshair"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {/* The Image */}
                    <img
                        src={imageSrc}
                        alt="Crop target"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* SVG overlay for drawing the polygon and lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                        {containerRef.current && (
                            <>
                                <polygon
                                    points={corners.map(c => {
                                        const rect = containerRef.current!.getBoundingClientRect();
                                        const scaleX = rect.width / imageWidth;
                                        const scaleY = rect.height / imageHeight;
                                        return `${c[0] * scaleX},${c[1] * scaleY}`;
                                    }).join(' ')}
                                    fill="rgba(59, 130, 246, 0.2)"
                                    stroke="url(#gradient)"
                                    strokeWidth="3"
                                    strokeDasharray="8 4"
                                    className="animate-pulse"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#60A5FA" />
                                        <stop offset="100%" stopColor="#3B82F6" />
                                    </linearGradient>
                                </defs>
                            </>
                        )}
                    </svg>

                    {/* Drag handles (calculated as absolute percentages or pixels if mounted) */}
                    {containerRef.current && corners.map((c, i) => {
                        const rect = containerRef.current!.getBoundingClientRect();
                        const scaleX = rect.width / imageWidth;
                        const scaleY = rect.height / imageHeight;
                        const left = c[0] * scaleX;
                        const top = c[1] * scaleY;

                        return (
                            <div
                                key={i}
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    handlePointerDown(i);
                                }}
                                className={cn(
                                    "absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center cursor-move z-20 transition-transform duration-100 touch-none",
                                    draggingIdx === i ? "scale-125" : "hover:scale-110"
                                )}
                                style={{
                                    left: `${left}px`,
                                    top: `${top}px`
                                }}
                            >
                                <div className="w-5 h-5 bg-white border-4 border-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-2 mb-4 shrink-0">
                <button
                    onClick={onCancel}
                    className="h-14 px-8 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-lg active:scale-95 transition-all uppercase font-black text-xs tracking-widest"
                >
                    Retake
                </button>
                <button
                    onClick={submit}
                    className="h-14 px-8 rounded-2xl bg-blue-600 flex items-center gap-2 text-white shadow-[0_4px_20px_-5px_rgba(37,99,235,0.6)] active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <Check size={18} strokeWidth={3} /> Save Crop
                </button>
            </div>
        </div>
    );
}
