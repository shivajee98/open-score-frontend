import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Loader2, ExternalLink, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/api';

const getStorageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://api.msmeloan.sbs/storage/${path}`;
};

interface Message {
    id: number;
    message: string;
    attachment_url?: string;
    is_admin_reply: boolean; // boolean from backend, 0 or 1
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface ChatWindowProps {
    messages: Message[];
    currentUserId: number;
    onSendMessage: (message: string, attachment?: File | null, attachmentLabel?: string) => Promise<void>;
    isLoading?: boolean;
    ticketStatus: string;
}

// Utility to auto-link URLs in text
const renderMessageWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold break-all hover:opacity-80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export default function ChatWindow({ messages, currentUserId, onSendMessage, isLoading, ticketStatus }: ChatWindowProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Purpose Selection State
    const [showPurposeModal, setShowPurposeModal] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState<string>('');

    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendClick = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || isSending) return;

        if (attachment) {
            setShowPurposeModal(true);
        } else {
            submitMessage();
        }
    };

    const submitMessage = async (purpose?: string) => {
        setIsSending(true);
        try {
            await onSendMessage(newMessage, attachment, purpose);
            setNewMessage('');
            setAttachment(null);
            setSelectedPurpose('');
            setShowPurposeModal(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsSending(false);
        }
    };

    const handlePurposeSelect = (purpose: string) => {
        setSelectedPurpose(purpose);
        setShowPurposeModal(false); // Close immediately for better UX
        submitMessage(purpose);
    };

    const isClosed = ticketStatus === 'closed';

    return (
        <div className="flex flex-col h-full bg-slate-50/50 relative">
            {/* Purpose Selection Modal */}
            {showPurposeModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-slate-900">What is this image for?</h3>
                            <button
                                onClick={() => setShowPurposeModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Please select a category to help us process your request faster.</p>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'EMI', icon: <CheckCircle2 size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
                                { label: 'Wallet', icon: <Briefcase size={16} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
                                { label: 'Platform Fee and Charges', icon: <AlertCircle size={16} />, color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300' },
                                { label: 'Other', icon: <ImageIcon size={16} />, color: 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300' }
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => handlePurposeSelect(option.label)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-95",
                                        option.color
                                    )}
                                >
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        {option.icon}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide text-center">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = currentUserId ? msg.user?.id === currentUserId || (msg as any).user_id === currentUserId : false;

                        return (
                            <div
                                key={msg.id || index}
                                className={cn(
                                    "flex w-full mb-4",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-2xl p-4 shadow-sm",
                                    isMe
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                                )}>
                                    {!isMe && (
                                        <p className="text-[10px] font-bold opacity-50 mb-1 uppercase tracking-wider">
                                            {msg.is_admin_reply ? 'Customer Support' : msg.user?.name || 'User'}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {renderMessageWithLinks(msg.message)}
                                    </p>

                                    {msg.attachment_url && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-white/20 shadow-inner group relative">
                                            <img
                                                src={getStorageUrl(msg.attachment_url!)}
                                                alt="Attachment"
                                                className="w-full max-h-60 object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                                                onClick={() => window.open(getStorageUrl(msg.attachment_url!), '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <ExternalLink size={20} className="text-white drop-shadow-lg" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "text-[10px] font-bold mt-2 text-right opacity-60",
                                        isMe ? "text-blue-100" : "text-slate-400"
                                    )}>
                                        {format(new Date(msg.created_at), 'h:mm a')}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                {isClosed ? (
                    <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-500">This ticket is closed. You can't send new messages.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendClick} className="flex flex-col gap-2">
                        {attachment && (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg w-fit border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                                    <img src={URL.createObjectURL(attachment)} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attached</span>
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{attachment.name}</span>
                                </div>
                                <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1.5 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-600 transition-colors ml-2">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <div className="flex items-end gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all rounded-2xl overflow-hidden relative flex items-center">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-100"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setAttachment(e.target.files[0]);
                                        }
                                    }}
                                />
                                <input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={attachment ? "Add a caption..." : "Type your message..."}
                                    className="flex-1 bg-transparent border-none p-3.5 focus:outline-none text-slate-900 placeholder:text-slate-400 text-sm font-medium w-full"
                                    disabled={isSending}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !attachment) || isSending}
                                className="p-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center min-w-[3.5rem]"
                            >
                                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

