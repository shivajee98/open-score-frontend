'use client';

import { X, CheckCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/api';

interface TransactionDetailModalProps {
    isOpen: boolean;
    transaction: any;
    onClose: () => void;
}

export default function TransactionDetailModal({ isOpen, transaction, onClose }: TransactionDetailModalProps) {
    if (!isOpen || !transaction) return null;

    const handleShareReceipt = async () => {
        try {
            const data = await apiFetch(`/wallet/transactions/${transaction.id}/share`, {
                method: 'POST'
            });
            toast.success(data.message || 'Receipt sent to your email');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send receipt to email');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200" onClick={onClose}>
            <div id="receipt-content" className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="bg-slate-50/50 rounded-3xl p-6 space-y-6 border border-slate-100">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                            To / From
                        </span>
                        <div className="text-right">
                            <p className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{transaction.counterparty_name}</p>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">
                                {transaction.counterparty_vpa === 'System' ? 'OpenScore Platform' : transaction.counterparty_vpa}
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full h-px bg-slate-200/50"></div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Date & Time</span>
                        <span className="font-black text-slate-700 text-xs">
                            {new Date(transaction.created_at).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                            }).replace(',', '')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Transfer ID</span>
                        <span className="font-black text-slate-700 text-[10px] font-mono tracking-tighter uppercase">
                            {transaction.display_id || `TRN-ID-${String(transaction.id).padStart(8, '0')}`}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Reference ID</span>
                        <span className="font-black text-slate-700 text-[10px] font-mono tracking-tighter uppercase">
                            {transaction.reference_id || `REF-ID-${transaction.id}`}
                        </span>
                    </div>

                    <div className="w-full h-px bg-slate-200/50"></div>

                    <div className="pt-2">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Description / Note</span>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden min-h-[60px]">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20"></div>
                            <p className="text-slate-900 text-[11px] font-black leading-relaxed tracking-tight break-words">
                                {transaction.description || 'No notes added for this transaction.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button
                        onClick={handleShareReceipt}
                        className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Share Receipt
                    </button>
                    <button
                        onClick={() => window.open(`mailto:support@openscore.com?subject=Help regarding TxID ${transaction.id}&body=I have an issue with this transaction: ${transaction.id}`)}
                        className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                    >
                        Need Help?
                    </button>
                </div>
            </div>
        </div>
    );
}
