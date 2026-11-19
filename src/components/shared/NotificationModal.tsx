'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Calendar,
    CreditCard,
    AlertTriangle,
    Info,
    Mail,
    Trash2,
    Loader2,
    ExternalLink,
    ArrowLeft,
    ArrowRight,
    Clock,
} from 'lucide-react';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification as apiDeleteNotification,
    clearAllNotifications as apiClearAll,
    type NotificationItem,
} from '@/lib/notifications-api';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getNotifications('guest', filter);
            setNotifications(data);
        } catch (err) {
            console.warn('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        } else {
            setSelectedNotification(null);
        }
    }, [isOpen, loadNotifications]);

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

    const handleOpenDetail = async (item: NotificationItem) => {
        setSelectedNotification(item);

        if (!item.read && !item.isRead) {
            const targetId = item.intId || item.id;
            await markNotificationAsRead(targetId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true, isRead: true } : n))
            );
            setSelectedNotification({ ...item, read: true, isRead: true });
        }
    };

    const handleMarkAsRead = async (id: string, intId?: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const targetId = intId || id;
        await markNotificationAsRead(targetId);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
        );
        if (selectedNotification?.id === id) {
            setSelectedNotification((prev) => (prev ? { ...prev, read: true, isRead: true } : null));
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
        if (selectedNotification) {
            setSelectedNotification((prev) => (prev ? { ...prev, read: true, isRead: true } : null));
        }
    };

    const handleDelete = async (id: string, intId?: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const targetId = intId || id;
        await apiDeleteNotification(targetId);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (selectedNotification?.id === id) {
            setSelectedNotification(null);
        }
    };

    const handleDeleteCurrent = async () => {
        if (!selectedNotification) return;
        const targetId = selectedNotification.intId || selectedNotification.id;
        await apiDeleteNotification(targetId);
        setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
        setSelectedNotification(null);
    };

    const handleClearAll = async () => {
        await apiClearAll();
        setNotifications([]);
        setSelectedNotification(null);
    };

    // Icon mapping helper
    const getNotificationIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'contact':
                return <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
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

    const getTypeLabel = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'contact':
                return 'Concierge Inquiry';
            case 'booking':
                return 'Reservation Update';
            case 'payment':
                return 'Billing & Payment';
            case 'warning':
                return 'Important Notice';
            case 'system':
            default:
                return 'Hotel Announcement';
        }
    };

    const getActionButtonText = (link: string) => {
        if (link.includes('/contact')) return 'Open Contact Desk';
        if (link.includes('/rooms')) return 'Browse Rooms & Suites';
        if (link.includes('/gallery')) return 'View Hotel Gallery';
        if (link.includes('/booking') || link.includes('/profile')) return 'View Reservations';
        return 'Go to Linked Page';
    };

    const getLinkPrompt = (link: string) => {
        if (link.includes('/contact')) return 'Need further assistance? Inquire or reply to our concierge.';
        if (link.includes('/rooms')) return 'Discover premium suites and seasonal room packages.';
        if (link.includes('/gallery')) return 'Explore pictures and spaces of Hotel Velora.';
        if (link.includes('/booking') || link.includes('/profile')) return 'Review your current and upcoming booking details.';
        return 'A direct page link is attached to this notification.';
    };

    const formatFullDate = (isoString?: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
            {/* Click Outside Container */}
            <div className="fixed inset-0" onClick={onClose} />

            {/* Modal Card Container */}
            <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col max-h-[85vh] transition-colors duration-300 animate-in fade-in zoom-in-95">
                {selectedNotification ? (
                    /* -------------------------------------------------------------------------- */
                    /* NOTIFICATION DETAIL VIEW                                                   */
                    /* -------------------------------------------------------------------------- */
                    <div className="flex flex-col h-full max-h-[85vh]">
                        {/* Detail Header */}
                        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40">
                            <button
                                type="button"
                                onClick={() => setSelectedNotification(null)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 px-2.5 rounded-xl hover:bg-muted"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back to notifications</span>
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Detail Content Body */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                            {/* Meta Badge & Timestamp */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                    {getNotificationIcon(selectedNotification.type)}
                                    <span>{getTypeLabel(selectedNotification.type)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{selectedNotification.timestamp}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                                    {selectedNotification.title}
                                </h3>
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Received: {formatFullDate(selectedNotification.createdAt)}</span>
                                </div>
                            </div>

                            {/* Message Container */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed shadow-2xs">
                                {selectedNotification.message}
                            </div>

                            {/* Optional Attached Action Link */}
                            {selectedNotification.link && (
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-semibold text-foreground">
                                            {getLinkPrompt(selectedNotification.link)}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                                            Path: {selectedNotification.link}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            router.push(selectedNotification.link!);
                                        }}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs w-full sm:w-auto shrink-0"
                                    >
                                        <span>{getActionButtonText(selectedNotification.link)}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            {/* Footer Management Actions */}
                            <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={handleDeleteCurrent}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-1.5 rounded-xl transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete notification</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedNotification(null)}
                                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition"
                                >
                                    Back to list
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* -------------------------------------------------------------------------- */
                    /* NOTIFICATION LIST VIEW                                                     */
                    /* -------------------------------------------------------------------------- */
                    <>
                        {/* Header */}
                        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="relative p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                                    <Bell className="w-5 h-5 text-primary" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-card">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                                    <p className="text-xs text-muted-foreground">Guest Updates & Concierge Inquiries</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters & Actions Bar */}
                        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/20 text-xs">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-full font-semibold transition ${
                                        filter === 'all'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
                                        filter === 'unread'
                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    Unread
                                    {unreadCount > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline ml-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
                            {loading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    Loading notifications...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-16 text-center text-muted-foreground">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="font-semibold text-sm">No notifications</p>
                                    <p className="text-xs mt-1">You are all caught up!</p>
                                </div>
                            ) : (
                                notifications.map((item) => {
                                    const isItemRead = item.read || item.isRead;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleOpenDetail(item)}
                                            className={`p-3.5 rounded-2xl flex flex-col gap-2 transition-colors cursor-pointer group ${
                                                !isItemRead
                                                    ? 'bg-primary/5 hover:bg-primary/10 border-l-4 border-primary'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-card border border-border shadow-2xs shrink-0 mt-0.5">
                                                    {getNotificationIcon(item.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className={`text-xs font-bold truncate ${!isItemRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {item.title}
                                                        </h4>
                                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                                            {item.timestamp}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                        {item.message}
                                                    </p>
                                                </div>

                                                {/* Action buttons on hover */}
                                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isItemRead && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleMarkAsRead(item.id, item.intId, e)}
                                                            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-card"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDelete(item.id, item.intId, e)}
                                                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-card"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Bottom Card Action Bar with Clickable "View details" Button */}
                                            <div className="flex items-center justify-between pt-1 pl-11">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDetail(item);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                                >
                                                    <span>View details</span>
                                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                                </button>

                                                {item.link && (
                                                    <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                                                        <ExternalLink className="w-2.5 h-2.5" /> Link attached
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
