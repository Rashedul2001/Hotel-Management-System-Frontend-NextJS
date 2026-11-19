"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Phone,
  Calendar,
  X,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getContactMessages,
  replyContactMessage,
  deleteContactMessage,
  type ContactMessageItem,
} from "@/lib/contact-api";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/components/ui/toast";

export default function PMSContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected message for viewing/replying
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Delete modal state
  const [messageToDelete, setMessageToDelete] = useState<ContactMessageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (err: any) {
      errorToast("Inquiries Error", err.message || "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Stats
  const totalCount = messages.length;
  const pendingCount = messages.filter((m) => m.status === "Pending").length;
  const repliedCount = messages.filter((m) => m.status === "Replied").length;

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesSubj = item.subject.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesSubj || matchesMsg;
      }

      return true;
    });
  }, [messages, statusFilter, searchQuery]);

  const handleOpenDetail = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyMessage || "");
  };

  const handleCloseDetail = () => {
    setSelectedMessage(null);
    setReplyText("");
    setSendingReply(false);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    if (!replyText.trim()) {
      errorToast("Reply Required", "Please enter a message to reply to the guest.");
      return;
    }

    try {
      setSendingReply(true);
      const updated = await replyContactMessage(selectedMessage.id, replyText.trim());

      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      );
      setSelectedMessage(updated);

      successToast(
        "Reply Dispatched",
        `Your reply was emailed to ${updated.email} and posted to their in-app notifications.`
      );
    } catch (err: any) {
      errorToast("Reply Failed", err.message || "Failed to transmit reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    try {
      setIsDeleting(true);
      await deleteContactMessage(messageToDelete.id);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      if (selectedMessage?.id === messageToDelete.id) {
        handleCloseDetail();
      }
      successToast("Inquiry Deleted", "The contact inquiry has been removed.");
      setMessageToDelete(null);
    } catch (err: any) {
      errorToast("Delete Failed", err.message || "Failed to delete inquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            <Mail className="h-4 w-4" /> Guest Communications
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Guest Contact Inquiries
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Review guest messages submitted from the public contact page, reply directly with free email dispatch, and send in-app notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMessages}
            disabled={loading}
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Inquiries
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Response
          </p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Replied to Guests
          </p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{repliedCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Email Delivery Service
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Free SMTP Ready
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Inquiries" },
            { id: "pending", label: `Pending (${pendingCount})` },
            { id: "replied", label: `Replied (${repliedCount})` },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
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

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Inquiries Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          Loading inquiries...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center bg-card/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No inquiries found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No inquiries match "${searchQuery}".`
              : statusFilter !== "all"
              ? `No inquiries in "${statusFilter}" status.`
              : "Guest inquiries submitted through the contact page will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isPending = msg.status === "Pending";
            return (
              <div
                key={msg.id}
                onClick={() => handleOpenDetail(msg)}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isPending
                    ? "bg-card border-amber-500/40 hover:border-amber-500 shadow-2xs border-l-4 border-l-amber-500"
                    : "bg-card/70 border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${
                      isPending
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {isPending ? <Clock className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isPending
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isPending ? "Pending Response" : "Replied"}
                      </span>

                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                        {msg.inquiryType}
                      </span>

                      <span className="text-[11px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground mt-1.5 group-hover:text-primary transition-colors truncate">
                      {msg.subject}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" /> {msg.fullName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" /> {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {msg.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <Button
                    size="sm"
                    variant={isPending ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(msg);
                    }}
                    className="rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isPending ? "View & Reply" : "View Details"}
                  </Button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMessageToDelete(msg);
                    }}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                    title="Delete inquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View & Reply Detail Modal */}
      {selectedMessage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedMessage.status === "Pending"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {selectedMessage.status === "Pending" ? "Pending Concierge Response" : "Replied"}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                    {selectedMessage.inquiryType}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-2">
                  {selectedMessage.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Guest Info Box */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4 mb-5 space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Guest Name
                  </span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {selectedMessage.fullName}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-semibold text-primary hover:underline text-xs mt-0.5 block truncate"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Phone Number
                  </span>
                  <p className="font-semibold text-foreground text-xs mt-0.5">
                    {selectedMessage.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                <span>Inquiry #{selectedMessage.id}</span>
              </div>
            </div>

            {/* Guest Message Body */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Inquiry Message
              </label>
              <div className="rounded-2xl border border-border bg-background p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Previous Reply if Replied */}
            {selectedMessage.replyMessage && (
              <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Reply sent by {selectedMessage.repliedBy || "Concierge"}
                  </span>
                  {selectedMessage.repliedAt && (
                    <span className="text-[10px] opacity-75 font-normal">
                      {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.replyMessage}
                </p>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {selectedMessage.status === "Replied" ? "Update or Send Another Reply" : "Compose Response to Guest"}
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Dispatches via Free SMTP & In-App Notification
                  </span>
                </div>

                {/* Quick response helpers */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "Thank you for contacting Hotel Velora. We would be delighted to assist you.",
                    "Your reservation inquiry has been approved. Our team has reserved your room.",
                    "Airport shuttle service is confirmed. Our driver will meet you at arrivals.",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(preset)}
                      className="rounded-lg border border-border bg-muted/40 hover:bg-muted px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground transition truncate max-w-[280px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder={`Write your reply to ${selectedMessage.fullName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseDetail}
                  disabled={sendingReply}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={sendingReply || !replyText.trim()}
                    className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Transmitting Email & Notification...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Reply & Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Guest Inquiry"
        description={
          messageToDelete
            ? `Are you sure you want to delete the inquiry "${messageToDelete.subject}" from ${messageToDelete.fullName}? This action cannot be undone.`
            : "Are you sure you want to delete this inquiry?"
        }
        confirmText="Delete Inquiry"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
