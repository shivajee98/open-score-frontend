'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lock, Delete, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface PinModalProps {
    isOpen: boolean;
    title?: string;
    mode?: 'SET' | 'VERIFY';
    onComplete: (pin: string) => void;
    onClose?: () => void;
    error?: string;
}

export default function PinModal({ isOpen, title = 'Enter Wallet PIN', mode = 'VERIFY', onComplete, onClose, error }: PinModalProps) {
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState<'ENTER' | 'CONFIRM'>('ENTER');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '', '', '']);
            setConfirmPin(['', '', '', '', '', '']);
            setStep('ENTER');
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    const handleInput = (index: number, value: string, isConfirm = false) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = isConfirm ? [...confirmPin] : [...pin];
        newPin[index] = value.slice(-1);

        if (isConfirm) setConfirmPin(newPin);
        else setPin(newPin);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check completion
        const fullPin = newPin.join('');
        if (fullPin.length === 6 && newPin.every(d => d !== '')) {
            if (mode === 'SET') {
                if (!isConfirm && step === 'ENTER') {
                    setTimeout(() => {
                        setStep('CONFIRM');
                        inputRefs.current[0]?.focus(); // Reset focus for confirm
                    }, 300);
                } else if (isConfirm) {
                    if (fullPin === pin.join('')) {
                        onComplete(fullPin);
                    } else {
                        toast.error("PINs do not match. Try again."); // Replaced alert with toast.error
                        setConfirmPin(['', '', '', '', '', '']);
                        inputRefs.current[0]?.focus();
                    }
                }
            } else {
                onComplete(fullPin);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
        if (e.key === 'Backspace') {
            const currentPin = isConfirm ? confirmPin : pin;
            if (!currentPin[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newPin = [...currentPin];
                newPin[index - 1] = '';
                isConfirm ? setConfirmPin(newPin) : setPin(newPin);
            } else {
                const newPin = [...currentPin];
                newPin[index] = '';
                isConfirm ? setConfirmPin(newPin) : setPin(newPin);
            }
        }
    };

    if (!isOpen) return null;

    const activePin = step === 'CONFIRM' ? confirmPin : pin;
    const activeTitle = mode === 'SET' ? (step === 'CONFIRM' ? 'Confirm New PIN' : 'Set New 6-Digit PIN') : title;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                )}

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{activeTitle}</h3>
                    <p className="text-slate-500 text-sm mt-2">
                        {mode === 'SET' && step === 'ENTER' ? 'Choose a secure PIN for your wallet.' :
                            mode === 'SET' && step === 'CONFIRM' ? 'Re-enter to confirm.' :
                                'Enter your security PIN to proceed.'}
                    </p>
                </div>

                <div className="flex gap-2 justify-center mb-8">
                    {activePin.map((digit, i) => (
                        <div key={i} className="relative">
                            <input
                                ref={el => { inputRefs.current[i] = el }}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInput(i, e.target.value, step === 'CONFIRM')}
                                onKeyDown={(e) => handleKeyDown(i, e, step === 'CONFIRM')}
                                className={`w-10 h-14 rounded-xl border-2 text-center text-2xl font-black transition-all outline-none 
                                    ${digit ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white text-slate-900 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'}`}
                            />
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-center text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" /> {error}
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Lock className="w-3 h-3" /> End-to-End Encrypted
                </div>
            </div>
        </div>
    );
}
