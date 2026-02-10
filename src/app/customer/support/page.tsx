"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TicketList from '@/components/support/TicketList';
import ChatWindow from '@/components/support/ChatWindow';
import CreateTicketModal from '@/components/support/CreateTicketModal';
import { Home, Plus, ArrowLeft, ScanBarcode, History, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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

    // Pre-filled ticket data from URL
    const [prefillData, setPrefillData] = useState<{
        subject?: string;
        message?: string;
        category?: string;
    } | null>(null);

    useEffect(() => {
        // Load user
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        fetchTickets();

        // Check for pre-filled ticket data in URL
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
                    // Auto-open the create ticket modal
                    setIsCreateModalOpen(true);
                }
            } catch (e) {
                console.error('Failed to parse ticket data:', e);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        // Polling removed in favor of WebSockets
    }, [selectedTicket]);

    const fetchTickets = async () => {
        try {
            const res = await apiFetch('/support/tickets');
            if (res && res.data) {
                setTickets(res.data);
                // If previously selected ticket exists, update it
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

    // Ref for polling to access latest state
    const messagesRef = React.useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const fetchMessages = async (ticketId: number, afterId?: number) => {
        try {
            let url = `/support/tickets/${ticketId}/messages`;
            if (afterId) {
                url += `?after_id=${afterId}`;
            }
            const res = await apiFetch(url);
            if (res && Array.isArray(res)) {
                if (res.length === 0) return; // No new messages

                setMessages(prev => {
                    if (afterId) {
                        // Filter duplicates
                        const newMsgs = res.filter(m => !prev.find(p => p.id === m.id));
                        return [...prev, ...newMsgs];
                    }
                    return res;
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!selectedTicket) return;

        // Initial Fetch
        fetchMessages(selectedTicket.id);

        // Setup Polling (3 seconds)
        const intervalId = setInterval(() => {
            const currentMsgs = messagesRef.current;
            const lastMsg = currentMsgs.length > 0 ? currentMsgs[currentMsgs.length - 1] : null;
            const afterId = lastMsg ? lastMsg.id : 0;

            fetchMessages(selectedTicket.id, afterId);
        }, 3000);

        // Cleanup
        return () => {
            clearInterval(intervalId);
        };
    }, [selectedTicket]);

    const handleCreateTicket = async (subject: string, message: string, priority: string, issueType: string) => {
        try {
            await apiFetch('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject, message, priority, issue_type: issueType })
            });
            fetchTickets();
            // Clear prefill data after creating
            setPrefillData(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!selectedTicket) return;
        try {
            await apiFetch(`/support/tickets/${selectedTicket.id}/message`, {
                method: 'POST',
                body: JSON.stringify({ message })
            });
            fetchMessages(selectedTicket.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setPrefillData(null); // Clear prefill when modal is closed
    };

    return (
        <DashboardLayout title="Support" navItems={navItems}>
            <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
                {/* Sidebar List - Hidden on mobile if ticket selected */}
                <div className={`w-full md:w-1/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-900">Your Tickets</h3>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            <TicketList
                                tickets={tickets}
                                onSelectTicket={setSelectedTicket}
                                selectedTicketId={selectedTicket?.id}
                            />
                        )}
                    </div>
                </div>

                {/* Chat Window - Hidden on mobile if NO ticket selected */}
                <div className={`w-full md:w-2/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedTicket.subject}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{selectedTicket.id}</p>
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
                            <h3 className="font-bold text-slate-900 mb-1">Select a Ticket</h3>
                            <p className="max-w-xs mx-auto text-sm">Choose a conversation from the list or start a new ticket.</p>
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
