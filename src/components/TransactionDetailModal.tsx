'use client';

import { X, Share2, Download, CheckCircle, Clock, Ban, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from '@/components/ui/Toast';

interface TransactionDetailModalProps {
    isOpen: boolean;
    transaction: any;
    onClose: () => void;
}

export default function TransactionDetailModal({ isOpen, transaction, onClose }: TransactionDetailModalProps) {
    if (!isOpen || !transaction) return null;

    const isCredit = transaction.type === 'CREDIT';

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200" onClick={onClose}>
            <div id="receipt-content" className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="text-center mt-4 mb-8">
                    <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl ${isCredit ? 'bg-emerald-100 text-emerald-600 shadow-emerald-200' : 'bg-rose-100 text-rose-600 shadow-rose-200'}`}>
                        {isCredit ? <ArrowDownLeft className="w-10 h-10 stroke-[3]" /> : <ArrowUpRight className="w-10 h-10 stroke-[3]" />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isCredit ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mt-3 uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Successful
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100/50">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            {(transaction.counterparty_vpa === 'System' || transaction.counterparty_vpa === 'Open Score') ? (isCredit ? 'Source' : 'Paid To') : 'To / From'}
                        </span>
                        <div className="text-right">
                            <p className="font-bold text-slate-900 text-base">{transaction.counterparty_name}</p>
                            <p className="text-slate-500 text-xs font-bold">{(transaction.counterparty_vpa === 'System' || transaction.counterparty_vpa === 'Open Score') ? (transaction.type === 'DEBIT' ? 'Withdrawal' : 'OpenScore Platform') : transaction.counterparty_vpa}</p>
                        </div>
                    </div>
                    <div className="w-full h-px bg-slate-200/50"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Date & Time</span>
                        <span className="font-bold text-slate-700 text-sm">
                            {new Date(transaction.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transfer ID</span>
                        <span className="font-bold text-slate-700 text-xs font-mono copy-text cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigator.clipboard.writeText(transaction.display_id || transaction.id)}>
                            {transaction.display_id || `TRN-ID-${String(transaction.id).padStart(8, '0')}`}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Reference ID</span>
                        <span className="font-bold text-slate-700 text-xs font-mono copy-text cursor-pointer hover:text-blue-600 transition-colors" onClick={() => navigator.clipboard.writeText(transaction.reference_id || transaction.id)}>
                            {transaction.reference_id || `REF-ID-${transaction.id}`}
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                    <button
                        onClick={async () => {
                            try {
                                const html2canvas = (await import('html2canvas')).default;
                                const element = document.getElementById('receipt-content');
                                if (!element) return;

                                const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 } as any);
                                canvas.toBlob(async (blob) => {
                                    if (!blob) {
                                        toast.error('Failed to generate receipt image.');
                                        return;
                                    }
                                    const file = new File([blob], `receipt_${transaction.id}.png`, { type: 'image/png' });

                                    // Use Web Share API
                                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                        try {
                                            await navigator.share({
                                                files: [file],
                                                title: 'OpenScore Receipt',
                                                text: 'Here is your payment receipt.'
                                            });
                                        } catch (error) {
                                            console.error('Sharing failed', error);
                                            downloadImage(canvas, transaction.id); // Fallback to download on share failure
                                        }
                                    } else {
                                        toast.error('Sharing not supported on this device.');
                                        downloadImage(canvas, transaction.id); // Fallback to download if sharing not supported
                                    }
                                });
                            } catch (err) {
                                console.error('Capture failed', err);
                                alert('Failed to capture receipt. Please try again.');
                            }
                        }}
                        className="py-2.5 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                        Share Receipt
                    </button>
                    <button
                        onClick={() => window.open(`mailto:support@openscore.com?subject=Help regarding TxID ${transaction.id}&body=I have an issue with this transaction: ${transaction.id}`)}
                        className="py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Need Help?
                    </button>
                </div>
            </div>
        </div>
    );
}

const downloadImage = (canvas: HTMLCanvasElement, id: string) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt_${id}.png`;
    link.click();
};
