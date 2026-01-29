'use client';

import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    amount: string;
    payeeName: string;
    transactionRef: string;
    onClose: () => void;
}

export default function PaymentSuccessModal({ isOpen, amount, payeeName, transactionRef, onClose }: PaymentSuccessModalProps) {
    const [animate, setAnimate] = useState(false);
    const [themeColor, setThemeColor] = useState('blue');

    useEffect(() => {
        if (isOpen) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setThemeColor(user.role === 'MERCHANT' ? 'emerald' : 'blue');
            }
            setTimeout(() => setAnimate(true), 100);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}>
                <div className={`bg-${themeColor}-600 p-6 text-center relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className={`w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-700 delay-200 ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                        <Check className={`w-10 h-10 text-${themeColor}-600 stroke-[4]`} />
                    </div>
                    <h3 className="text-white font-black text-xl tracking-tight mb-1">Payment Success!</h3>
                    <p className={`text-${themeColor}-100 text-sm font-medium opacity-90`}>{transactionRef.substring(0, 18)}...</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Amount</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{parseFloat(amount).toFixed(2)}</h2>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full bg-${themeColor}-100 flex items-center justify-center text-${themeColor}-600 font-bold`}>
                                {payeeName[0]}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Paid to</p>
                                <p className="text-sm font-bold text-slate-900">{payeeName}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
