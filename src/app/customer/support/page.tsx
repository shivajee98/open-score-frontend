"use client";

import React, { useState, useEffect } from 'react';
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

export default function CustomerSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        fetchTickets();
    }, []);

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

    const fetchMessages = async (ticketId: number) => {
        try {
            const res = await apiFetch(`/support/tickets/${ticketId}`);
            if (res && res.messages) {
                setMessages(res.messages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!selectedTicket) return;

        // Fetch initial
        fetchMessages(selectedTicket.id);

        // Setup Echo Listener
        let echoInstance: any;
        import('@/lib/echo').then(({ createEcho }) => {
            const token = localStorage.getItem('token');
            const echo = createEcho(token || undefined);
            echoInstance = echo;

            echo.private(`support.ticket.${selectedTicket.id}`)
                .listen('.MessageSent', (e: any) => {
                    console.log('New Message:', e.message);
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                });
        });

        // Cleanup
        return () => {
            if (echoInstance) {
                echoInstance.leave(`support.ticket.${selectedTicket.id}`);
            }
        };
    }, [selectedTicket]);

    const handleCreateTicket = async (subject: string, message: string, priority: string) => {
        try {
            await apiFetch('/support/tickets', {
                method: 'POST',
                body: JSON.stringify({ subject, message, priority })
            });
            fetchTickets();
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
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
            />
        </DashboardLayout>
    );
}
