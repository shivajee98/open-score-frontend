'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, X, Paperclip, Image as ImageIcon, Plus, MessageSquare, 
    Loader2, Trash2, Check, Shield, HelpCircle, ChevronLeft, ArrowRight
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/loanUtils';

const DIRECT_CATEGORY_ID = 6;

// Simple formatter
const formatTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(date);
    } catch {
        return '';
    }
};

interface DirectSupportChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DirectSupportChat({ isOpen, onClose }: DirectSupportChatProps) {
    const [view, setView] = useState<'history' | 'chat'>('history');
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/support/tickets');
            // Support for both array and Laravel paginated object
            const allTickets = Array.isArray(res) ? res : (res?.data || []);
            
            const helpTickets = allTickets.filter((t: any) => 
                (t.category_id == DIRECT_CATEGORY_ID || (t.category && t.category.id == DIRECT_CATEGORY_ID))
            );
            setTickets(helpTickets);
        } catch (err) {
            console.error('History Error:', err);
            toast.error('Failed to load support history');
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = async () => {
        setIsSending(true);
        try {
            const newTicket = await apiFetch('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({
                    subject: 'Vendor Assistance',
                    message: 'I need help with vendor operations.',
                    priority: 'high',
                    category_id: DIRECT_CATEGORY_ID
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            handleSelectTicket(newTicket);
            setTickets([newTicket, ...tickets]);
        } catch (err) {
            toast.error('Failed to start new chat');
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        setMessages(ticket.messages || []);
        setView('chat');
        fetchMessages(ticket.id);
    };

    const fetchMessages = async (ticketId: number, afterId?: number) => {
        try {
            let url = `/support/tickets/${ticketId}/messages`;
            if (afterId) url += `?after_id=${afterId}`;
            const res = await apiFetch(url);
            
            const msgData = Array.isArray(res) ? res : (res?.data || res?.messages || []);

            if (Array.isArray(msgData)) {
                if (msgData.length === 0) return;
                setMessages(prev => {
                    if (afterId) {
                        const newMsgs = msgData.filter((m: any) => !prev.find((p: any) => p.id === m.id));
                        return [...prev, ...newMsgs];
                    }
                    return msgData;
                });
            }
        } catch (err) {
            console.error('Failed to load messages');
        }
    };

    // Auto-poll every 1s (matches reference implementation)
    useEffect(() => {
        if (!selectedTicket || view !== 'chat' || !isOpen) return;

        // Initial fetch
        fetchMessages(selectedTicket.id);

        const interval = setInterval(() => {
            const currentMsgs = messagesRef.current;
            const lastMsg = currentMsgs.length > 0 ? currentMsgs[currentMsgs.length - 1] : null;
            const afterId = lastMsg ? lastMsg.id : 0;
            fetchMessages(selectedTicket.id, afterId);
        }, 1000);
        return () => clearInterval(interval);
    }, [selectedTicket?.id, view, isOpen]);

    // Mock typing effect for demonstration
    useEffect(() => {
        if (view !== 'chat' || !selectedTicket || !isOpen) return;
        const trigger = () => {
            if (Math.random() > 0.7) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };
        const interval = setInterval(trigger, 12000);
        return () => clearInterval(interval);
    }, [view, selectedTicket, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !attachment) || isSending || !selectedTicket) return;

        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            if (attachment) formData.append('attachment', attachment);

            const res = await apiFetch(`/support/tickets/${selectedTicket.id}/message`, {
                method: 'POST',
                body: formData
            });

            setMessages([...messages, res]);
            setNewMessage('');
            setAttachment(null);
            setShowPlusMenu(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 lg:left-72 z-50 flex flex-col bg-white animate-in slide-in-from-right duration-500 overflow-hidden border-l border-slate-200 shadow-2xl">
            {view === 'history' ? (
                /* History View */
                <div className="flex-1 flex flex-col p-8 overflow-hidden bg-slate-50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Support Center</h2>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1.5">Previous Discussions</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                        <button 
                            onClick={startNewChat}
                            disabled={isSending}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] group disabled:opacity-50"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black uppercase tracking-widest text-[12px]">New Discussion</p>
                                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Post your query</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="space-y-3 pb-10">
                            {tickets.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                                    <HelpCircle size={48} className="mb-4 text-slate-400" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No previous work history</p>
                                </div>
                            ) : (
                                tickets.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleSelectTicket(t)}
                                        className="w-full bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg p-5 rounded-3xl flex items-center justify-between group transition-all"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 bg-indigo-50 border border-indigo-100",
                                                t.status === 'closed' && "text-slate-400 bg-slate-50 border-slate-100"
                                            )}>
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-none lowercase">support_#{t.id}</p>
                                                <p className="text-[10px] text-slate-500 mt-2 font-bold truncate max-w-[150px] uppercase tracking-tight">
                                                    {t.last_message || t.message || 'Help Request'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatTime(t.updated_at || t.created_at)}</p>
                                            <div className={cn(
                                                "mt-2 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block border",
                                                t.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                            )}>
                                                {t.status}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Chat View */
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('history')} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90 border border-slate-200">
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=support" alt="Agent" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">Support Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Assistance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <Loader2 size={32} className="mb-4 text-indigo-600 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Discussion...</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = !msg.is_admin_reply;
                                return (
                                    <div key={msg.id || index} className={cn("flex w-full", isMe ? "justify-end" : "justify-start animate-in slide-in-from-bottom-2 duration-300")}>
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 mt-1 flex-shrink-0 border border-white shadow-sm">
                                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=support" alt="Agent" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="space-y-1 group max-w-[85%]">
                                            {!isMe && (
                                                <p className="text-[9px] font-black text-slate-400 px-1 uppercase tracking-widest">Support Team</p>
                                            )}
                                            <div className={cn(
                                                "rounded-[2rem] px-5 py-3.5 shadow-sm relative transition-all",
                                                isMe 
                                                    ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100" 
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-slate-100"
                                            )}>
                                                <p className="text-[13px] font-semibold leading-relaxed whitespace-pre-wrap tracking-tight">{msg.message}</p>
                                                
                                                {msg.attachment_url && (
                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group/img relative">
                                                        <img 
                                                            src={msg.attachment_url.startsWith('http') ? msg.attachment_url : `https://api.msmeloan.sbs/storage/${msg.attachment_url}`} 
                                                            alt="Attachment" 
                                                            className="w-full max-h-60 object-cover cursor-pointer hover:scale-105 transition-all duration-700"
                                                            onClick={() => window.open(msg.attachment_url.startsWith('http') ? msg.attachment_url : `https://api.msmeloan.sbs/storage/${msg.attachment_url}`, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={cn("flex items-center gap-2 mt-0.5 px-1", isMe ? "justify-end" : "justify-start")}>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{formatTime(msg.created_at)}</p>
                                                {isMe && (
                                                    <div className="flex items-center gap-0.5 opacity-60">
                                                        <Check size={10} className="text-emerald-500" />
                                                        <p className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter">Seen</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {isTyping && (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white shadow-sm">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=support" alt="Agent" className="w-full h-full object-cover" />
                                </div>
                                <div className="bg-white px-5 py-3.5 rounded-3xl rounded-bl-none border border-slate-100 shadow-sm shadow-slate-100">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-indigo-600/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-600/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-600/30 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-slate-100">
                        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                            {attachment && (
                                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl w-fit border border-slate-100 mb-4 animate-in slide-in-from-bottom-2 duration-300 shadow-sm">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-inner">
                                        <img src={URL.createObjectURL(attachment)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ready to send</p>
                                        <p className="text-[11px] font-black text-slate-900 mt-1 truncate max-w-[120px]">{attachment.name}</p>
                                    </div>
                                    <button type="button" onClick={() => setAttachment(null)} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors ml-2">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm transition-all active:scale-95",
                                            showPlusMenu && "rotate-45 bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-indigo-600"
                                        )}
                                    >
                                        <Plus size={24} />
                                    </button>

                                    {showPlusMenu && (
                                        <div className="absolute bottom-16 left-0 w-48 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-2 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 z-[60]">
                                            <button 
                                                type="button"
                                                onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                                            >
                                                <Paperclip size={18} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Document</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                                            >
                                                <ImageIcon size={18} />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Gallery</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all rounded-[2rem] flex items-center px-4">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => e.target.files?.[0] && setAttachment(e.target.files[0])} 
                                    />
                                    <input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Write your message..."
                                        className="flex-1 bg-transparent border-none py-4 focus:outline-none text-slate-900 placeholder:text-slate-400 text-[14px] font-bold"
                                        disabled={isSending}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleSendMessage()}
                                    disabled={(!newMessage.trim() && !attachment) || isSending}
                                    className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0"
                                >
                                    {isSending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
