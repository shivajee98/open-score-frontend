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
        <div className="flex flex-col w-full h-full bg-slate-50 overflow-hidden select-none touch-none">
            {/* Header Area */}
            <div className="px-6 pt-10 pb-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                    <h3 className="text-slate-900 text-sm font-black uppercase tracking-[0.2em]">Adjust Edges</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Drag corners to align with document
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        title="Cancel and Retake"
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {/* Cropping Canvas Area */}
            <div className="flex-1 relative bg-slate-200 overflow-hidden flex items-center justify-center p-4">
                {/* Visual texture/grain for depth */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/felt.png")'}} />
                
                <div 
                    ref={containerRef}
                    className="relative w-full h-full max-w-4xl max-h-full aspect-auto flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    {/* The Image */}
                    <img
                        src={imageSrc}
                        alt="Crop target"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none bg-slate-100"
                    />

                    {/* Dark overlay for the outside of the crop area */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                        {containerRef.current && (
                            <>
                                <mask id="crop-mask-v2">
                                    <rect width="100%" height="100%" fill="white" />
                                    <polygon
                                        points={corners.map(c => {
                                            const rect = containerRef.current!.getBoundingClientRect();
                                            const scaleX = rect.width / imageWidth;
                                            const scaleY = rect.height / imageHeight;
                                            return `${c[0] * scaleX},${c[1] * scaleY}`;
                                        }).join(' ')}
                                        fill="black"
                                    />
                                </mask>
                                <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.75)" mask="url(#crop-mask-v2)" className="backdrop-blur-[2px]" />

                                {/* The crop boundary line - animated dashed line */}
                                <polygon
                                    points={corners.map(c => {
                                        const rect = containerRef.current!.getBoundingClientRect();
                                        const scaleX = rect.width / imageWidth;
                                        const scaleY = rect.height / imageHeight;
                                        return `${c[0] * scaleX},${c[1] * scaleY}`;
                                    }).join(' ')}
                                    fill="transparent"
                                    stroke="#3B82F6"
                                    strokeWidth="2"
                                    strokeDasharray="6 4"
                                    className="animate-[dash_20s_linear_infinite]"
                                />
                            </>
                        )}
                    </svg>

                    {/* Drag handles (Sophisticated brackets) */}
                    {containerRef.current && corners.map((c, i) => {
                        const rect = containerRef.current!.getBoundingClientRect();
                        const scaleX = rect.width / imageWidth;
                        const scaleY = rect.height / imageHeight;
                        const left = c[0] * scaleX;
                        const top = c[1] * scaleY;

                        // TL (0), TR (1), BR (2), BL (3)
                        const bracketClasses = [
                            "border-t-[3px] border-l-[3px] rounded-tl-sm translate-x-2 translate-y-2", // TL
                            "border-t-[3px] border-r-[3px] rounded-tr-sm -translate-x-2 translate-y-2", // TR
                            "border-b-[3px] border-r-[3px] rounded-br-sm -translate-x-2 -translate-y-2", // BR
                            "border-b-[3px] border-l-[3px] rounded-bl-sm translate-x-2 -translate-y-2"  // BL
                        ][i];

                        return (
                            <div
                                key={i}
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    handlePointerDown(i);
                                }}
                                className="absolute w-20 h-20 -ml-10 -mt-10 flex items-center justify-center cursor-move z-20 touch-none group"
                                style={{ left: `${left}px`, top: `${top}px` }}
                            >
                                {/* Magnifier / Active state indicator */}
                                {draggingIdx === i && (
                                    <div className="absolute -top-16 w-16 h-16 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden pointer-events-none">
                                         <img
                                            src={imageSrc}
                                            className="absolute"
                                            style={{
                                                width: `${rect.width * 2}px`,
                                                height: `${rect.height * 2}px`,
                                                left: `-${left * 2 - 32}px`,
                                                top: `-${top * 2 - 32}px`,
                                                maxWidth: 'none'
                                            }}
                                            alt="Magnifier"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-0.5 h-full bg-blue-500/30" />
                                            <div className="h-0.5 w-full bg-blue-500/30 absolute" />
                                        </div>
                                    </div>
                                )}

                                {/* Brackets */}
                                <div className={cn(
                                    "w-10 h-10 border-blue-500 bg-transparent transition-all duration-150",
                                    bracketClasses,
                                    draggingIdx === i ? "scale-110 border-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,1)]" : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                )} />
                                
                                {/* Center dot for precision */}
                                <div className={cn(
                                    "absolute w-1.5 h-1.5 rounded-full bg-blue-500 transition-all",
                                    draggingIdx === i ? "scale-150 shadow-[0_0_10px_rgba(59,130,246,1)]" : "opacity-0"
                                )} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-8 bg-white border-t border-slate-100 flex items-center justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="h-14 px-10 rounded-2xl bg-slate-50 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all"
                >
                    Retake Photo
                </button>
                <button
                    onClick={submit}
                    className="h-14 px-12 rounded-2xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3"
                >
                    Confirm & Scan <Check size={18} strokeWidth={4} />
                </button>
            </div>

            <style jsx>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -1000;
                    }
                }
            `}</style>
        </div>
    );
}
