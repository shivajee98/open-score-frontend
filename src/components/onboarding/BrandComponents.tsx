import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col items-center ${className}`}>
        <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tighter">
            Open Score
        </span>
    </div>
);

export const Tagline = ({ className = "" }: { className?: string }) => (
    <p className={`text-slate-500 font-medium text-sm tracking-wide ${className}`}>
        Scheme Budget Support
    </p>
);

export const SecondaryTagline = ({ className = "" }: { className?: string }) => (
    <p className={`text-blue-500 font-bold text-xs uppercase tracking-widest ${className}`}>
        Zero-Interest Credit for MSMEs
    </p>
);

export const Watermark = () => (
    <div className="brand-watermark" />
);

export const BrandBadge = ({ text }: { text: string }) => (
    <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
        <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            {text}
        </span>
    </div>
);
