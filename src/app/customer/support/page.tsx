"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TicketList from '@/components/support/TicketList';
import ChatWindow from '@/components/support/ChatWindow';
import CreateTicketModal from '@/components/support/CreateTicketModal';
import { Home, Plus, ArrowLeft, ScanBarcode, History, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

const navItems = [
    { label: 'Home', href: '/customer', icon: <Home size={20} /> },
    { label: 'Scan & Pay', href: '/customer/pay?scan=true', icon: <ScanBarcode size={20} /> },
    { label: 'History', href: '/customer/transactions', icon: <History size={20} /> },
    { label: 'Profile', href: '/customer/profile', icon: <User size={20} /> },
];

function SupportPageContent() {
    const searchParams = useSearchParams();
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [ticketFilter, setTicketFilter] = useState<'active' | 'closed'>('active');

    const [prefillData, setPrefillData] = useState<{
        subject?: string;
        message?: string;
        category?: string;
    } | null>(null);

    const filteredTickets = (tickets || []).filter(ticket => {
        const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';
        return ticketFilter === 'closed' ? isClosed : !isClosed;
    });

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        fetchTickets();

        const ticketParam = searchParams.get('ticket');
        if (ticketParam) {
            try {
                const data = JSON.parse(decodeURIComponent(ticketParam));
                if (data.prefill) {
                    setPrefillData({
                        subject: data.subject || '',
                        message: data.message || '',
                        category: data.category || ''
                    });

                    if (data.autoSubmit) {
                        handleCreateTicket(
                            data.subject || 'Support Request',
                            data.message || 'Auto-generated request',
                            'normal', // priority
                            data.category || 'General' // issueType
                        );
                    } else {
                        setIsCreateModalOpen(true);
                    }
                } else if (data.id) {
                    // Direct navigation to created ticket
                    setSelectedTicket(data);
                    // Ensure it's in the list if not already
                    setTickets(prev => {
                        if (!prev.find(t => t.id === data.id)) {
                            return [data, ...prev];
                        }
                        return prev;
                    });
                }
            } catch (e) {
                console.error('Failed to parse ticket data:', e);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        fetchTickets();
    }, [ticketFilter]);

    const fetchTickets = async () => {
        try {
            const res = await apiFetch(`/support/tickets?status=${ticketFilter}`);
            if (res && res.data) {
                setTickets(res.data);
                if (selectedTicket) {
                    const found = res.data.find((t: any) => t.id === selectedTicket.id);
                    if (found) setSelectedTicket(found);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const messagesRef = React.useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const fetchMessages = async (ticketId: number, afterId?: number) => {
        try {
            let url = `/support/tickets/${ticketId}/messages`;
            if (afterId) url += `?after_id=${afterId}`;
            const res = await apiFetch(url);

            // Handle direct array, { data: [...] }, or { messages: [...] } responses
            const msgData = Array.isArray(res) ? res : (res?.data || res?.messages || []);

            if (Array.isArray(msgData)) {
                if (msgData.length === 0) return;
                setMessages(prev => {
                    if (afterId) {
                        const newMsgs = msgData.filter((m: any) => !prev.find(p => p.id === m.id));
                        return [...prev, ...newMsgs];
                    }
                    return msgData; // Initial load or full refresh
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!selectedTicket) {
            setMessages([]);
            return;
        }
        // Clear old messages first to avoid stale data
        setMessages([]);

        fetchMessages(selectedTicket.id);
        const intervalId = setInterval(() => {
            const currentMsgs = messagesRef.current;
            const lastMsg = currentMsgs.length > 0 ? currentMsgs[currentMsgs.length - 1] : null;
            const afterId = lastMsg ? lastMsg.id : 0;
            fetchMessages(selectedTicket.id, afterId);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [selectedTicket]);

    const handleCreateTicket = async (subject: string, message: string, priority: string, issueType: string) => {
        try {
            await apiFetch('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject, message, priority, issue_type: issueType })
            });
            fetchTickets();
            toast.success('Ticket created successfully');
            setPrefillData(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create ticket');
        }
    };

    const handleSendMessage = async (message: string, attachment?: File | null, attachmentLabel?: string) => {
        if (!selectedTicket) return;
        try {
            let body: any;

            if (attachment) {
                const formData = new FormData();
                formData.append('message', message || `Shared an image${attachmentLabel ? ` (${attachmentLabel})` : ''}`);
                formData.append('attachment', attachment);
                if (attachmentLabel) {
                    formData.append('attachment_label', attachmentLabel);
                }
                body = formData;
            } else {
                body = JSON.stringify({ message });
            }

            const res = await apiFetch(`/support/tickets/${selectedTicket.id}/message`, {
                method: 'POST',
                body: body
            });

            if (res && res.id) {
                setMessages(prev => [...prev, res]);
            }

            // Still fetch in background just in case
            fetchMessages(selectedTicket.id, messagesRef.current.length > 0 ? messagesRef.current[messagesRef.current.length - 1].id : 0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setPrefillData(null);
    };

    return (
        <DashboardLayout title="Support" navItems={navItems}>
            <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
                <div className={`w-full md:w-1/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="bg-slate-200/50 p-1 rounded-xl flex">
                                <button
                                    onClick={() => setTicketFilter('active')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ticketFilter === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setTicketFilter('closed')}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ticketFilter === 'closed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 ml-2 flex items-center gap-1 active:scale-95"
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider">Need help (Click here)</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <TicketList
                                tickets={filteredTickets}
                                onSelectTicket={setSelectedTicket}
                                selectedTicketId={selectedTicket?.id}
                            />
                        )}
                    </div>
                </div>

                <div className={`w-full md:w-2/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedTicket.subject}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ref-No: {selectedTicket.id}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ChatWindow
                                    messages={messages}
                                    currentUserId={currentUser?.id}
                                    onSendMessage={handleSendMessage}
                                    ticketStatus={selectedTicket.status}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <Home size={32} className="text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Support Center</h3>
                            <p className="max-w-xs mx-auto text-sm font-medium">Select an active conversation or check your archive.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleCreateTicket}
                prefillSubject={prefillData?.subject}
                prefillMessage={prefillData?.message}
                prefillCategory={prefillData?.category}
            />
        </DashboardLayout>
    );
}

export default function CustomerSupportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
        }>
            <SupportPageContent />
        </Suspense>
    );
}
