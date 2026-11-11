'use client';

import React, { useState } from 'react';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Calendar,
    CreditCard,
    AlertTriangle,
    Info,
    CheckCircle2,
    Trash2
} from 'lucide-react';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: 'booking' | 'payment' | 'system' | 'warning';
    read: boolean;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'notif-1',
        title: 'New Booking Request',
        message: 'Room 304 (Deluxe Suite) has been booked by Sarah Jenkins for Oct 12–15.',
        timestamp: '10m ago',
        type: 'booking',
        read: false,
    },
    {
        id: 'notif-2',
        title: 'Payment Received',
        message: 'Invoice #INV-2026-892 paid successfully (৳45,000) via SSLCommerz.',
        timestamp: '1h ago',
        type: 'payment',
        read: false,
    },
    {
        id: 'notif-3',
        title: 'Maintenance Alert',
        message: 'AC maintenance scheduled for 4th Floor rooms on Friday at 10:00 AM.',
        timestamp: '3h ago',
        type: 'warning',
        read: true,
    },
    {
        id: 'notif-4',
        title: 'System Update',
        message: 'Database backup and performance optimizations completed successfully.',
        timestamp: '1d ago',
        type: 'system',
        read: true,
    },
];

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.read).length;

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Icon mapping helper
    const getNotificationIcon = (type: NotificationItem['type']) => {
        switch (type) {
            case 'booking':
                return <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
            case 'payment':
                return <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
            case 'system':
            default:
                return <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">

            {/* Click Outside Container */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Modal Card Container */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[85vh] transition-colors duration-300">

                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="relative p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Hotel Activity & System Alerts</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters & Actions Bar */}
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30 text-xs">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${filter === 'all'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${filter === 'unread'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                    )}
                </div>

                {/* Notification List Body */}
                <div className="overflow-y-auto p-4 space-y-3 divide-y divide-transparent">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`group relative p-4 rounded-2xl transition-all duration-200 border ${notif.read
                                        ? 'bg-transparent border-transparent opacity-75 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                        : 'bg-blue-50/40 dark:bg-slate-800/60 border-blue-100 dark:border-slate-700/60 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-3.5">

                                    {/* Category Icon */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/80 shrink-0">
                                        {getNotificationIcon(notif.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {notif.title}
                                            </h4>
                                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                                                {notif.timestamp}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                                            {notif.message}
                                        </p>

                                        {/* Inline Quick Action */}
                                        {!notif.read && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                <Check className="w-3 h-3" /> Mark as read
                                            </button>
                                        )}
                                    </div>

                                    {/* Delete Action (Visible on Hover) */}
                                    <button
                                        onClick={() => deleteNotification(notif.id)}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">All caught up!</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No notifications to show here.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs">
                        <button
                            onClick={clearAll}
                            className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors font-medium"
                        >
                            Clear all notifications
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
                        >
                            Close
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}