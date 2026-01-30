"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TicketList from '@/components/support/TicketList';
import ChatWindow from '@/components/support/ChatWindow';
import { Home, ArrowLeft, Filter } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/loanUtils';

// Mock nav items for Admin layout if not exported centrally
// In a real scenario, import these from a constants file or admin/page.tsx
const adminNavItems = [
    { label: 'Admin Dashboard', href: '/admin', icon: <Home size={20} /> },
];

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setCurrentUser(JSON.parse(stored));
        fetchTickets();
    }, [filterStatus]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
            interval = setInterval(() => fetchMessages(selectedTicket.id), 3000);
        }
        return () => clearInterval(interval);
    }, [selectedTicket]);

    const fetchTickets = async () => {
        try {
            const query = filterStatus ? `?status=${filterStatus}` : '';
            const res = await apiFetch(`/admin/support/tickets${query}`);
            if (res && res.data) {
                setTickets(res.data);
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

    const handleStatusChange = async (status: string) => {
        if (!selectedTicket) return;
        try {
            await apiFetch(`/support/tickets/${selectedTicket.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            // Update local state
            setSelectedTicket({ ...selectedTicket, status });
            fetchTickets(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DashboardLayout title="Customer Support" navItems={adminNavItems}>
            <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
                {/* Sidebar List */}
                <div className={`w-full md:w-1/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-900">All Tickets</h3>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['', 'open', 'in_progress', 'closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border",
                                        filterStatus === status
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {status || 'All'}
                                </button>
                            ))}
                        </div>
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

                {/* Chat Window */}
                <div className={`w-full md:w-2/3 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{selectedTicket.subject}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-bold">{selectedTicket.user?.name || 'Unknown User'}</span>
                                            <span>•</span>
                                            <span>{selectedTicket.user?.email || selectedTicket.user?.mobile_number}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="closed">Closed</option>
                                    </select>
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
                            <p className="max-w-xs mx-auto text-sm">Select a ticket from the left to view details and reply.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
