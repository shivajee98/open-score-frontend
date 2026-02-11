import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Loader2, ExternalLink, Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/loanUtils';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/api';

const getStorageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = API_BASE_URL.replace('/api', '');
    return `${base}/storage/${path}`;
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
    onSendMessage: (message: string, attachment?: File | null) => Promise<void>;
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

    useEffect(() => {
        setLocalMessages(messages);
    }, [messages]);

    useEffect(() => {
        // Initialize Echo
        import('@/lib/echo').then(({ createEcho }) => {
            const echo = createEcho();
            // Assuming we have ticketId attached to a message or passed via props. 
            // Wait, we don't have ticketId in props locally here? 
            // We need to look at parent usage or infer.
            // Actually, we need ticketId. Let's inspect ONE message to get ticket_id or pass it in props.
            // Passed in props is safer. But we only have `messages`.
            // Let's rely on the parent component passing `messages` which updates via polling for now? 
            // No, we want to REMOVE polling.
            // We need to add `ticketId` to props.
        });
    }, []);
    // Wait, I need to update the interface first.

    // ... logic placeholder ...

    // Actually, let's update the Parent Page to handle the listening and pass updated messages down.
    // That is cleaner. The ChatWindow should just be a dumb UI component.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(newMessage, attachment);
            setNewMessage('');
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsSending(false);
        }
    };

    const isClosed = ticketStatus === 'closed';

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
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
                    <form onSubmit={handleSend} className="flex flex-col gap-2">
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

