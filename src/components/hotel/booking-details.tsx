"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Share2,
  Sparkles,
  UserRound,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";
import { errorToast, infoToast, successToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatDisplayDate, calculateNights } from "@/lib/date-utils";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85";

type Booking = {
  id: string;
  confirmationNumber: string;
  roomName: string;
  roomCategory: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingForSomeoneElse: boolean;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  specialRequests: string;
  roomSize: string;
  beds: string;
  maxGuests: number;
  amenities: string[];
};

type BookingDetailsProps = {
  booking?: Booking | null;
  bookingId?: string;
};

function formatDate(dateString: string) {
  return formatDisplayDate(dateString);
}

function getNights(checkIn: string, checkOut: string) {
  return calculateNights(checkIn, checkOut);
}

function formatCurrency(amount: number) {
  const rounded = Math.round(amount || 0);
  return `৳${rounded.toLocaleString("en-BD")}`;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        icon: CheckCircle2,
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };

    case "completed":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className:
          "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        className:
          "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
      };

    default:
      return {
        label: status,
        icon: Clock3,
        className:
          "border-muted-foreground/20 bg-muted text-muted-foreground",
      };
  }
}

export default function BookingDetails({
  booking: initialBooking,
  bookingId,
}: BookingDetailsProps) {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking && Boolean(bookingId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBooking) {
      setCurrentBooking(initialBooking);
      return;
    }
    const idToFetch = bookingId || (typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean).pop() : undefined);
    if (!currentBooking && idToFetch) {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const res = await apiFetch(`/api/bookings/${idToFetch}`);
          if (!res.ok) {
            throw new Error("Could not find this booking.");
          }
          const data = await res.json();
          if (active) {
            setCurrentBooking({
              id: data.id,
              confirmationNumber: data.confirmationNumber,
              roomName: data.roomName,
              roomCategory: data.roomCategory,
              roomImage: data.roomImage || DEFAULT_IMAGE,
              checkIn: data.checkInDate,
              checkOut: data.checkOutDate,
              guests: data.guestsCount,
              guestName: data.guestName,
              guestEmail: data.guestEmail,
              guestPhone: data.guestPhone,
              bookingForSomeoneElse: data.isBookingForSomeoneElse,
              total: data.totalPrice,
              paymentStatus: data.paidAt ? "Paid" : "Pending",
              paymentMethod: data.paymentMethod || "SSLCommerz",
              status: data.status,
              specialRequests: data.specialRequests || "",
              roomSize: "45 sq m",
              beds: "King Bed",
              maxGuests: data.guestsCount,
              amenities: [
                "Free High-speed Wi-Fi",
                "Air Conditioning",
                "Ensuite Bathroom",
                "Smart TV",
                "Breakfast Service Available",
              ],
            });
          }
        } catch (err: any) {
          if (active) setLoadError(err.message || "Failed to load booking.");
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }
  }, [initialBooking, bookingId, currentBooking]);

  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="size-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading your booking details...</p>
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <FileText className="size-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          {loadError || "We could not find the details for this reservation. It may have expired or belongs to a different account."}
        </p>
        <div className="flex gap-4">
          <Link
            href="/bookings"
            className="bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition"
          >
            View My Bookings
          </Link>
          <Link
            href="/rooms"
            className="border border-border font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-muted transition"
          >
            Explore Rooms
          </Link>
        </div>
      </div>
    );
  }

  const booking = currentBooking;

  const handlePayNow = async () => {
    try {
      setPaying(true);
      infoToast("SSLCommerz", "Connecting to payment portal...");
      const res = await apiFetch(`/api/bookings/${booking.id}/pay`, {
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
      setPaying(false);
    }
  };

  const nights = getNights(booking.checkIn, booking.checkOut);
  const status = getStatusStyles(booking.status);
  const StatusIcon = status.icon;

  const subtotal = booking.total * 0.9;
  const taxes = booking.total - subtotal;

  async function copyConfirmation() {
    try {
      await navigator.clipboard.writeText(booking.confirmationNumber);

      setCopied(true);
      successToast("Copied", "Confirmation number copied to clipboard.");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      errorToast("Clipboard Error", "Unable to copy confirmation number.");
    }
  }

  async function shareBooking() {
    const shareData = {
      title: `${booking.roomName} — Velora Hotels`,
      text: `Booking ${booking.confirmationNumber}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      successToast("Copied", "Booking link copied to clipboard.");
    } catch {
      // User cancelled native share.
    }
  }

  function downloadConfirmation() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/20">
        <div className="hotel-container py-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to My Bookings
            </Link>

            <button
              type="button"
              onClick={shareBooking}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="hotel-container py-8 sm:py-12">
        {/* Confirmation hero */}
        <section className="mb-8 overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

            <img
              src={booking.roomImage}
              alt={booking.roomName}
              className="h-[260px] w-full object-cover sm:h-[340px]"
            />

            <div className="absolute inset-0 flex items-end">
              <div className="p-6 text-white sm:p-8 lg:p-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-md">
                  <StatusIcon className="size-4" />
                  {status.label}
                </div>

                <h1 className="hotel-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
                  {booking.roomName}
                </h1>

                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Your reservation at Velora Hotels
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Confirmation
              </p>

              <button
                type="button"
                onClick={copyConfirmation}
                className="mt-2 inline-flex items-center gap-2 text-lg font-semibold tracking-wide hover:underline"
              >
                {booking.confirmationNumber}

                {copied ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                )}
              </button>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Booking status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${status.className}`}
                >
                  <StatusIcon className="size-4" />
                  {status.label}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Total
              </p>

              <p className="mt-2 text-xl font-semibold">
                {formatCurrency(booking.total)}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Stay details */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-primary">
                  Your stay
                </p>

                <h2 className="hotel-display mt-1 text-2xl font-semibold sm:text-3xl">
                  Reservation details
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span className="text-sm font-medium">
                      Check-in
                    </span>
                  </div>

                  <p className="text-lg font-semibold">
                    {formatDate(booking.checkIn)}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    From 3:00 PM
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/20 p-5">
                  <div className="mb-4 flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span className="text-sm font-medium">
                      Check-out
                    </span>
                  </div>

                  <p className="text-lg font-semibold">
                    {formatDate(booking.checkOut)}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Before 11:00 AM
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Clock3 className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Duration
                    </p>
                    <p className="font-medium">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Users className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Guests
                    </p>
                    <p className="font-medium">
                      {booking.guests}{" "}
                      {booking.guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <BedDouble className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Room
                    </p>
                    <p className="font-medium">{booking.roomCategory}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Room */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Accommodation
                  </p>

                  <h2 className="hotel-display mt-1 text-2xl font-semibold">
                    {booking.roomName}
                  </h2>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs font-medium">
                  {booking.roomCategory}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
                <img
                  src={booking.roomImage}
                  alt={booking.roomName}
                  className="h-44 w-full rounded-2xl object-cover sm:h-32"
                />

                <div>
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <span>{booking.roomSize}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BedDouble className="size-4 text-primary" />
                      <span>{booking.beds}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      <span>Up to {booking.maxGuests}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {booking.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Guest */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-primary">
                  Guest information
                </p>

                <h2 className="hotel-display mt-1 text-2xl font-semibold">
                  Staying guest
                </h2>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">{booking.guestName}</p>

                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <span className="break-all">
                          {booking.guestEmail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="size-4" />
                        <span>{booking.guestPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {booking.bookingForSomeoneElse && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">
                        Booking for someone else
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        The reservation was made by your account for the
                        guest shown above.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Special requests */}
            {booking.specialRequests && (
              <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <FileText className="size-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-primary">
                      Guest request
                    </p>

                    <h2 className="hotel-display text-xl font-semibold">
                      Special requests
                    </h2>
                  </div>
                </div>

                <p className="rounded-2xl border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                  {booking.specialRequests}
                </p>
              </section>
            )}

            {/* Hotel information */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-5">
                <p className="text-sm font-medium text-primary">
                  Velora Hotels
                </p>

                <h2 className="hotel-display mt-1 text-2xl font-semibold">
                  Hotel information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-muted p-2.5">
                    <MapPin className="size-4" />
                  </div>

                  <div>
                    <p className="font-medium">Velora Hotels</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-xl bg-muted p-2.5">
                    <Phone className="size-4" />
                  </div>

                  <div>
                    <p className="font-medium">Guest Services</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Available 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Payment summary */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Receipt className="size-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-primary">
                    Payment
                  </p>

                  <h2 className="hotel-display text-xl font-semibold">
                    Price summary
                  </h2>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Room × {nights} nights
                  </span>

                  <span>
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Taxes & fees
                  </span>

                  <span>{formatCurrency(taxes)}</span>
                </div>

                <div className="my-4 border-t" />

                <div className="flex justify-between gap-4 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(booking.total)}</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Payment status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />

                  <span className="text-sm font-medium">
                    {booking.paymentStatus}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Method: {booking.paymentMethod}
                </p>
              </div>
            </section>

            {/* Actions */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">Manage booking</h3>

              <div className="mt-4 space-y-2">
                {booking.status === "pending" && (
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handlePayNow}
                    className="flex w-full items-center justify-between rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-3">
                      {paying ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CreditCard className="size-4" />
                      )}
                      Complete Payment (Pay Now)
                    </span>

                    <ChevronRight className="size-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={downloadConfirmation}
                  className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Download className="size-4" />
                    Download confirmation
                  </span>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={shareBooking}
                  className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <Share2 className="size-4" />
                    Share booking
                  </span>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>

                <Link
                  href="/rooms"
                  className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-3">
                    <ExternalLink className="size-4" />
                    Book another stay
                  </span>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </div>
            </section>

            {/* Help */}
            <section className="rounded-3xl border bg-primary p-6 text-primary-foreground shadow-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-5 shrink-0" />

                <div>
                  <h3 className="font-semibold">
                    Need help with your stay?
                  </h3>

                  <p className="mt-2 text-sm leading-6 opacity-80">
                    Our guest services team is available 24/7 to assist
                    with your reservation.
                  </p>

                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
                  >
                    Contact Guest Services
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}