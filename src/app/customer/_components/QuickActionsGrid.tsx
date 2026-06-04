"use client";

import React, { useState } from 'react';
import { Scan, Send, Repeat, QrCode, Gift, MoreHorizontal, ChevronUp, MessageSquare, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface QuickActionsGridProps {
  hasActiveLoan?: boolean;
  activeLoanId?: number;
  hasInboxMessages?: boolean;
  onInboxClick?: () => void;
  unreadCount?: number;
}

export default function QuickActionsGrid({
  hasActiveLoan = false,
  activeLoanId,
  hasInboxMessages = false,
  onInboxClick,
  unreadCount = 0,
}: QuickActionsGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const allActions = [
    { id: 1, label: 'Scan QR', icon: <Scan size={20} strokeWidth={2.5} />, bg: 'bg-linear-to-br from-violet-500 to-indigo-600 shadow-violet-200/50', href: '/customer/qr-payment' },
    { id: 2, label: 'Pay ID', icon: <Send size={20} strokeWidth={2.5} />, bg: 'bg-linear-to-br from-blue-500 to-blue-700 shadow-blue-200/50', href: '/customer/transfer' },
    { id: 3, label: 'Send Money', icon: <Repeat size={20} strokeWidth={2.5} />, bg: 'bg-linear-to-br from-emerald-400 to-green-600 shadow-emerald-200/50', href: '/customer/pay' },
    { id: 4, label: 'Show QR', icon: <QrCode size={20} strokeWidth={2.5} />, bg: 'bg-linear-to-br from-orange-400 to-amber-500 shadow-orange-200/50', href: '/customer/qr' },
  ];

  if (hasInboxMessages) {
    allActions.push({
      id: 'inbox',
      label: 'Inbox',
      icon: (
        <div className="relative">
          <MessageSquare size={20} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border border-white rounded-full animate-bounce" />
          )}
        </div>
      ),
      bg: 'bg-linear-to-br from-indigo-500 to-purple-600 shadow-purple-200/50',
      href: '#',
      onClick: onInboxClick,
    } as any);
  }

  allActions.push({
    id: 5,
    label: 'Rewards',
    icon: <Gift size={20} strokeWidth={2.5} />,
    bg: 'bg-linear-to-br from-pink-500 to-rose-600 shadow-pink-200/50',
    href: '/customer/rewards',
  });

  if (hasActiveLoan) {
    allActions.push({
      id: 'repay',
      label: 'Repay',
      icon: <CreditCard size={20} strokeWidth={2.5} />,
      bg: 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-200/50',
      href: `/customer/loan/status/repayment?id=${activeLoanId}`,
    } as any);
  }

  const toggleAction = isExpanded
    ? { id: 'toggle', label: 'Less', icon: <ChevronUp size={20} strokeWidth={3} />, bg: 'bg-slate-100 shadow-slate-200/50', color: 'text-slate-600', href: '#', onClick: () => setIsExpanded(false) }
    : { id: 'toggle', label: 'More', icon: <MoreHorizontal size={20} strokeWidth={3} />, bg: 'bg-slate-100 shadow-slate-200/50', color: 'text-slate-600', href: '#', onClick: () => setIsExpanded(true) };

  const showToggle = allActions.length > 4;
  const visibleActions = showToggle 
    ? (isExpanded ? [...allActions, toggleAction] : [...allActions.slice(0, 3), toggleAction])
    : allActions;

  return (
    <section className="px-2 py-2">
      <div className="bg-white rounded-[24px] p-5 shadow-xl shadow-slate-200/60 border border-slate-100 transition-all duration-300">
        <div className="gap-y-5 transition-all duration-300 grid grid-cols-4">
            {visibleActions.map((action: any) => {
              const ActionWrapper = action.onClick ? 'button' : Link;
              const wrapperProps = action.onClick 
                ? { onClick: action.onClick, className: 'flex flex-col items-center gap-2 group px-1 shrink-0' } 
                : { href: action.href, className: 'flex flex-col items-center gap-2 group px-1 shrink-0' };

              return (
                <ActionWrapper key={action.id} {...(wrapperProps as any)}>
                    <div
                    className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${action.bg} ${action.color || 'text-white'}`}
                    >
                    {action.icon}
                    </div>
                    <span className="text-[9px] font-black text-slate-800 tracking-tight text-center">{action.label}</span>
                </ActionWrapper>
              );
            })}
        </div>
      </div>
    </section>
  );
}
