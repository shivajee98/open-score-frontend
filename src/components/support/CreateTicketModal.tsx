import React, { useState, useEffect } from 'react';
import { X, Loader2, MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/loanUtils';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subject: string, message: string, priority: string) => Promise<void>;
    prefillSubject?: string;
    prefillMessage?: string;
}

export default function CreateTicketModal({
    isOpen,
    onClose,
    onSubmit,
    prefillSubject,
    prefillMessage
}: CreateTicketModalProps) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update fields when prefill data changes
    useEffect(() => {
        if (prefillSubject) setSubject(prefillSubject);
        if (prefillMessage) setMessage(prefillMessage);
        // Set priority to high for fund release requests
        if (prefillSubject?.includes('Fund Release')) {
            setPriority('high');
        }
    }, [prefillSubject, prefillMessage]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;

        setIsSubmitting(true);
        try {
            await onSubmit(subject, message, priority);
            onClose();
            // Reset form
            setSubject('');
            setMessage('');
            setPriority('medium');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPrefilled = !!prefillSubject || !!prefillMessage;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"></div>

            <div
                className="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrefilled ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                {isPrefilled ? 'Raise Support Ticket' : 'New Ticket'}
                            </h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                                {isPrefilled ? 'Review and send your request' : 'Describe your issue'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {isPrefilled && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-amber-800 text-xs font-bold">
                            ⚡ This ticket has been pre-filled. Please review and click "Send Ticket" to submit.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Priority</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['low', 'medium', 'high'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        "py-3 rounded-xl text-sm font-bold border transition-all capitalize",
                                        priority === p
                                            ? p === 'high'
                                                ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-600/20 transform scale-[1.02]"
                                                : "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform scale-[1.02]"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Explain your issue in detail..."
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium h-32 resize-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 mt-4 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${isPrefilled
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                            }`}
                    >
                        {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <span>{isPrefilled ? 'Send Ticket' : 'Submit Ticket'}</span>}
                    </button>
                </form>
            </div>
        </div>
    );
}
