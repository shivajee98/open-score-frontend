'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, ChevronLeft, Loader2, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import ChatWindow from './ChatWindow';
import CreateTicketModal from './CreateTicketModal';
import TicketList from './TicketList';
import { cn } from '@/lib/loanUtils';

interface SupportTicketScreenProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    initialView?: 'list' | 'direct';
    directCategoryId?: number | string;
}

export default function SupportTicketScreen({ isOpen, onClose, userId, initialView = 'list', directCategoryId }: SupportTicketScreenProps) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [view, setView] = useState<'list' | 'direct'>(initialView);

    useEffect(() => {
        if (isOpen) {
            if (directCategoryId) {
                handleDirectHelp();
            } else {
                fetchTickets();
            }
        }
    }, [isOpen, directCategoryId]);

    const handleDirectHelp = async () => {
        setIsLoading(true);
        try {
            // Check for existing active ticket of this category
            const res = await apiFetch('/support/tickets');
            const existing = res.find((t: any) => 
                (t.category_id == directCategoryId || (t.category && t.category.id == directCategoryId)) && 
                t.status !== 'closed'
            );

            if (existing) {
                handleSelectTicket(existing);
            } else {
                // Create new ticket automatically
                const newTicket = await apiFetch('/support/tickets', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        subject: 'Direct Assistance / Support Help', 
                        message: 'I need assistance regarding my account/work.', 
                        priority: 'high', 
                        category_id: directCategoryId 
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                handleSelectTicket(newTicket);
            }
        } catch (err) {
            toast.error('Failed to initialize help chat');
            fetchTickets(); // Fallback to list
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/support/tickets');
            setTickets(res);
        } catch (err) {
            toast.error('Failed to load tickets');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (ticketId: number) => {
        setIsChatLoading(true);
        try {
            const res = await apiFetch(`/support/tickets/${ticketId}/messages`);
            setMessages(res);
        } catch (err) {
            toast.error('Failed to load messages');
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSelectTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        fetchMessages(ticket.id);
    };

    const handleSendMessage = async (message: string, attachment?: File | null, attachmentLabel?: string) => {
        if (!selectedTicket) return;

        try {
            const formData = new FormData();
            formData.append('message', message);
            if (attachment) {
                formData.append('attachment', attachment);
                if (attachmentLabel) formData.append('attachment_label', attachmentLabel);
            }

            const res = await apiFetch(`/support/tickets/${selectedTicket.id}/message`, {
                method: 'POST',
                body: formData
            });

            setMessages([...messages, res]);
        } catch (err) {
            toast.error('Failed to send message');
        }
    };

    const handleCreateTicket = async (subject: string, message: string, priority: string, issueType: string) => {
        try {
            const res = await apiFetch('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject, message, priority, category_id: issueType }),
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success('Ticket created successfully');
            fetchTickets();
            setShowCreateModal(false);
        } catch (err) {
            toast.error('Failed to create ticket');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={selectedTicket ? () => setSelectedTicket(null) : onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95">
                        <ChevronLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                            {selectedTicket ? 'Ticket Conversation' : 'Support Center'}
                        </h2>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                            {selectedTicket ? `#${selectedTicket.id} - ${selectedTicket.subject}` : 'We are here to help'}
                        </p>
                    </div>
                </div>
                {!selectedTicket && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {selectedTicket ? (
                    <ChatWindow
                        messages={messages}
                        currentUserId={userId}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                        ticketStatus={selectedTicket.status}
                    />
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Tickets...</p>
                            </div>
                        ) : tickets.length > 0 ? (
                            <>
                                {/* Active Tickets */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Active Discussions</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {tickets.filter(t => t.status !== 'closed').map(ticket => (
                                            <div
                                                key={ticket.id}
                                                onClick={() => handleSelectTicket(ticket)}
                                                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                                                        <Clock size={12} /> {ticket.status}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300">#{ticket.id}</span>
                                                </div>
                                                <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.messages?.[0]?.message || 'No messages'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Archived Tickets */}
                                {tickets.some(t => t.status === 'closed') && (
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Archived History</h3>
                                        <div className="grid grid-cols-1 gap-3 opacity-70">
                                            {tickets.filter(t => t.status === 'closed').map(ticket => (
                                                <div
                                                    key={ticket.id}
                                                    onClick={() => handleSelectTicket(ticket)}
                                                    className="bg-slate-100/50 p-5 rounded-[2rem] border border-slate-200/50 cursor-pointer grayscale hover:grayscale-0 transition-all active:scale-[0.98] relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-2xl">
                                                        Archived
                                                    </div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                                            <CheckCircle2 size={12} /> Resolved
                                                        </div>
                                                    </div>
                                                    <h4 className="font-black text-slate-600">{ticket.subject}</h4>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ticket.messages?.[0]?.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-12">
                                <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-200 shadow-inner">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Ready to Help</h3>
                                <p className="text-sm font-medium text-slate-500 mt-2 mb-8">You haven't raised any support tickets yet. Click the plus button to start a conversation.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl active:scale-95 transition-all"
                                >
                                    New Support Ticket
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateTicket}
            />
        </div>
    );
}
