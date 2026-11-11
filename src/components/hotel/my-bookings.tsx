"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    CreditCard,
    ExternalLink,
    Loader2,
    MapPin,
    MoreHorizontal,
    RefreshCw,
    Search,
    User,
    Users,
    XCircle,
} from "lucide-react";
import { errorToast, infoToast, successToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/date-utils";

type BookingStatus =
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled";

type PaymentStatus =
    | "paid"
    | "pending"
    | "refunded"
    | "pay-at-hotel";

type Booking = {
    id: string;
    confirmationNumber: string;
    roomId: string;
    roomName: string;
    category: string;
    image: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    guestName: string;
    guestEmail: string;
    bookingForSomeoneElse: boolean;
    total: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
};

type FilterTab = "upcoming" | "past" | "cancelled";

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85";

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");
    const [search, setSearch] = useState("");
    const [menuBooking, setMenuBooking] = useState<string | null>(null);
    const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);

    const handleResumePayment = async (bookingId: string) => {
        try {
            setPayingId(bookingId);
            infoToast("SSLCommerz", "Connecting to payment portal...");
            const res = await apiFetch(`/api/bookings/${bookingId}/pay`, {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to initialize payment.");
            }
            if (data.gatewayPageUrl) {
                successToast("Redirecting", "Connecting to SSLCommerz payment gateway...");
                window.location.href = data.gatewayPageUrl;
            } else {
                throw new Error("No payment URL received.");
            }
        } catch (err: any) {
            errorToast("Payment Error", err.message || "Could not resume payment. Please try again.");
            setPayingId(null);
        }
    };

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiFetch("/api/bookings/my-bookings");
            if (res.ok) {
                const data = await res.json();
                const mapped: Booking[] = data.map((b: any) => ({
                    id: b.id,
                    confirmationNumber: b.confirmationNumber,
                    roomId: b.roomId,
                    roomName: b.roomName,
                    category: b.roomCategory,
                    image: b.roomImage || DEFAULT_IMAGE,
                    checkIn: b.checkInDate,
                    checkOut: b.checkOutDate,
                    guests: b.guestsCount,
                    nights: b.nights,
                    guestName: b.guestName,
                    guestEmail: b.guestEmail,
                    bookingForSomeoneElse: b.isBookingForSomeoneElse,
                    total: b.totalPrice,
                    status: (b.status || "pending").toLowerCase() as BookingStatus,
                    paymentStatus: (b.paidAt ? "paid" : "pending") as PaymentStatus,
                    createdAt: b.createdAt,
                }));
                setBookings(mapped);
            }
        } catch (err) {
            console.error("Failed to load user bookings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const filteredBookings = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                !normalizedSearch ||
                booking.roomName.toLowerCase().includes(normalizedSearch) ||
                booking.confirmationNumber
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                booking.guestName.toLowerCase().includes(normalizedSearch);

            if (!matchesSearch) return false;

            if (activeTab === "upcoming") {
                return (
                    booking.status === "confirmed" ||
                    booking.status === "pending"
                );
            }

            if (activeTab === "past") {
                return booking.status === "completed";
            }

            return booking.status === "cancelled";
        });
    }, [bookings, activeTab, search]);

    const counts = useMemo(() => {
        return {
            upcoming: bookings.filter(
                (booking) =>
                    booking.status === "confirmed" ||
                    booking.status === "pending"
            ).length,

            past: bookings.filter(
                (booking) => booking.status === "completed"
            ).length,

            cancelled: bookings.filter(
                (booking) => booking.status === "cancelled"
            ).length,
        };
    }, [bookings]);

    const formatDate = (date: string) => {
        return formatDisplayDate(date);
    };

    const getStatus = (status: BookingStatus) => {
        switch (status) {
            case "confirmed":
                return {
                    label: "Confirmed",
                    className:
                        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    icon: CheckCircle2,
                };

            case "pending":
                return {
                    label: "Pending",
                    className:
                        "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                    icon: Clock3,
                };

            case "completed":
                return {
                    label: "Completed",
                    className:
                        "bg-secondary text-secondary-foreground",
                    icon: CheckCircle2,
                };

            case "cancelled":
                return {
                    label: "Cancelled",
                    className:
                        "bg-destructive/10 text-destructive",
                    icon: XCircle,
                };
        }
    };

    const getPaymentLabel = (status: PaymentStatus) => {
        switch (status) {
            case "paid":
                return "Paid in full (SSLCommerz)";
            case "pending":
                return "Pending payment";
            case "refunded":
                return "Refunded";
            case "pay-at-hotel":
                return "Pay at hotel";
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="hotel-container py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Account reservations
                        </p>

                        <h1 className="hotel-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                            My bookings
                        </h1>

                        <p className="mt-2 text-muted-foreground">
                            Manage your stays, view reservation codes, and review invoice details in BDT.
                        </p>
                    </div>

                    <Link
                        href="/rooms"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 self-start sm:self-auto"
                    >
                        Book another room
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {(
                            [
                                { key: "upcoming", label: "Upcoming" },
                                { key: "past", label: "Past stays" },
                                { key: "cancelled", label: "Cancelled" },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition ${
                                    activeTab === tab.key
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        activeTab === tab.key
                                            ? "bg-primary-foreground/20 text-primary-foreground"
                                            : "bg-background text-muted-foreground"
                                    }`}
                                >
                                    {counts[tab.key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by room or code..."
                            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Loading your bookings...
                            </p>
                        </div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="mt-12 rounded-3xl border border-dashed border-border p-12 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                            <CalendarDays className="size-6" />
                        </div>

                        <h2 className="mt-4 text-xl font-semibold">
                            No reservations found
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {search
                                ? "No bookings match your search query."
                                : activeTab === "upcoming"
                                ? "You have no upcoming stays booked right now."
                                : activeTab === "past"
                                ? "You have no past completed stays."
                                : "You have no cancelled bookings."}
                        </p>

                        <div className="mt-6 flex justify-center gap-3">
                            {search ? (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
                                >
                                    Clear search
                                </button>
                            ) : (
                                <Link
                                    href="/rooms"
                                    className="h-10 inline-flex items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
                                >
                                    Explore rooms & suites
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6">
                        {filteredBookings.map((booking) => {
                            const status = getStatus(booking.status);
                            const StatusIcon = status.icon;

                            return (
                                <article
                                    key={booking.id}
                                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-md"
                                >
                                    <div className="grid md:grid-cols-[280px_1fr]">
                                        {/* Image */}
                                        <div className="relative h-56 md:h-full">
                                            <Image
                                                src={booking.image}
                                                alt={booking.roomName}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 280px"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent md:hidden" />
                                            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                                                {booking.category}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-col justify-between p-5 sm:p-6">
                                            <div>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {booking.confirmationNumber}
                                                        </span>
                                                        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                                                            {booking.roomName}
                                                        </h2>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                                                    >
                                                        <StatusIcon className="size-3.5" />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Meta */}
                                                <div className="mt-4 grid gap-3 border-y border-border py-4 text-xs sm:grid-cols-3">
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Check-in
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {formatDate(booking.checkIn)}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Check-out
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {formatDate(booking.checkOut)}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Guest & stay
                                                        </p>
                                                        <p className="mt-1 font-medium">
                                                            {booking.guestName} ({booking.nights}N, {booking.guests}G)
                                                        </p>
                                                        {booking.bookingForSomeoneElse && (
                                                            <span className="text-[10px] text-primary">
                                                                Booked for someone else
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Total Amount (BDT)
                                                    </p>
                                                    <p className="text-xl font-bold text-foreground">
                                                        {formatCurrency(booking.total)}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {getPaymentLabel(booking.paymentStatus)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {booking.status === "pending" && (
                                                        <button
                                                            type="button"
                                                            disabled={payingId === booking.id}
                                                            onClick={() => handleResumePayment(booking.id)}
                                                            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                                                        >
                                                            {payingId === booking.id ? (
                                                                <>
                                                                    <Loader2 className="size-3.5 animate-spin" />
                                                                    Connecting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="size-3.5" />
                                                                    Pay Now
                                                                </>
                                                            )}
                                                        </button>
                                                    )}

                                                    {booking.status === "confirmed" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCancelBooking(booking)}
                                                            className="h-10 rounded-xl border border-destructive/30 px-3 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/bookings/${booking.id}`}
                                                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                                                    >
                                                        View details
                                                        <ChevronRight className="size-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cancel Booking Modal */}
            {cancelBooking && (
                <CancelBookingModal
                    booking={cancelBooking}
                    onClose={() => setCancelBooking(null)}
                    onSuccess={() => {
                        setCancelBooking(null);
                        loadBookings();
                    }}
                />
            )}
        </main>
    );
}

function CancelBookingModal({
    booking,
    onClose,
    onSuccess,
}: {
    booking: Booking;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        try {
            setSubmitting(true);
            setError("");
            const res = await apiFetch(`/api/bookings/${booking.id}/cancel`, {
                method: "POST",
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Could not cancel booking.");
            }
            onSuccess();
        } catch (err: any) {
            console.error("Cancellation error:", err);
            setError(err.message || "Failed to cancel booking.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
                <h3 className="text-xl font-semibold">Cancel reservation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Are you sure you want to cancel your stay at{" "}
                    <strong>{booking.roomName}</strong> (Code:{" "}
                    <strong>{booking.confirmationNumber}</strong>)?
                </p>

                <div className="mt-4 rounded-2xl bg-secondary/60 p-4 text-xs text-muted-foreground">
                    <p>Total Amount: <strong className="text-foreground">{formatCurrency(booking.total)}</strong></p>
                    <p className="mt-1">Dates: {booking.checkIn} to {booking.checkOut}</p>
                </div>

                {error && (
                    <p className="mt-3 text-xs text-destructive">{error}</p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
                    >
                        Keep reservation
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="h-10 rounded-xl bg-destructive px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Cancelling..." : "Confirm cancellation"}
                    </button>
                </div>
            </div>
        </div>
    );
}
