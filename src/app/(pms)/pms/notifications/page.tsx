"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  Calendar,
  CreditCard,
  AlertTriangle,
  Info,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  type NotificationItem,
} from "@/lib/notifications-api";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/components/ui/toast";

export default function PMSNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications("staff", "all");
      setNotifications(data);
    } catch (err: any) {
      errorToast("Notifications Error", err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const isUnread = !item.read && !item.isRead;
      if (activeTab === "unread" && !isUnread) return false;
      if (activeTab === "contact" && item.type.toLowerCase() !== "contact") return false;
      if (activeTab === "booking" && item.type.toLowerCase() !== "booking") return false;
      if (activeTab === "warning" && item.type.toLowerCase() !== "warning") return false;
      if (activeTab === "system" && item.type.toLowerCase() !== "system") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        return matchesTitle || matchesMsg;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleMarkAsRead = async (id: string, intId?: number) => {
    const targetId = intId || id;
    await markNotificationAsRead(targetId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    successToast("Updated", "All staff notifications marked as read.");
  };

  const handleDelete = async (id: string, intId?: number) => {
    const targetId = intId || id;
    await deleteNotification(targetId);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setNotifications([]);
    successToast("Cleared", "All staff notifications have been cleared.");
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "contact":
        return <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case "system":
      default:
        return <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            <Bell className="h-4 w-4" /> Activity Feed & Tasks
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Staff Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Review incoming guest contact inquiries, real-time booking updates, and system operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-xl text-xs gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "contact", label: "Inquiries" },
            { id: "booking", label: "Bookings" },
            { id: "warning", label: "Alerts" },
            { id: "system", label: "System" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center bg-card/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No notifications found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No notifications match "${searchQuery}".`
              : activeTab !== "all"
              ? `No ${activeTab} notifications at this time.`
              : "All caught up! No recent notifications to review."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((item) => {
            const isItemRead = item.read || item.isRead;
            return (
              <div
                key={item.id}
                className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  !isItemRead
                    ? "bg-card border-primary/40 shadow-xs border-l-4 border-l-primary"
                    : "bg-card/70 border-border opacity-85 hover:opacity-100"
                }`}
              >
                <div className="p-3 rounded-2xl bg-muted/60 border border-border shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {item.type}
                      </span>
                      <h3
                        className={`text-sm font-bold truncate ${
                          !isItemRead ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => {
                          if (!isItemRead) handleMarkAsRead(item.id, item.intId);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        Go to Details <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}

                    {!isItemRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id, item.intId)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" /> Mark as read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.intId)}
                      className="text-xs font-medium text-destructive hover:underline inline-flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
