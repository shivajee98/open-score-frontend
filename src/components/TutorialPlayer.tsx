"use client";

import React from 'react';
import { Player } from '@remotion/player';
import { TutorialVideo } from '@/remotion/TutorialVideo';
import { X } from 'lucide-react';

interface TutorialPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TutorialPlayer({ isOpen, onClose }: TutorialPlayerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[210] p-2 bg-white/50 backdrop-blur-md hover:bg-white rounded-full transition-colors"
                >
                    <X size={20} className="text-slate-900" />
                </button>

                {/* Player */}
                <div className="aspect-[9/16] w-full">
                    <Player
                        component={TutorialVideo}
                        durationInFrames={600}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        controls
                        autoPlay
                        loop
                    />
                </div>
            </div>
        </div>
    );
}
