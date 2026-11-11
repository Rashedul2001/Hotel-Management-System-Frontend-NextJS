"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { errorToast, infoToast, successToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";
import { useAuth } from "@/providers/AuthContext";
import { useAuthModal } from "@/providers/auth-modal-context";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDateToDDMMYYYY,
  parseDateString,
  validateStayDates,
} from "@/lib/date-utils";
import { startOfDay, isBefore, isSameDay, addDays } from "date-fns";

type Props = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  initialError?: string;
};

const DEFAULT_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85";

export default function CheckoutPage({
  roomId,
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  guests: initialGuests,
  initialError = "",
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { openLogin } = useAuthModal();

  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dates & Guests
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(() =>
    parseDateString(initialCheckIn)
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(() =>
    parseDateString(initialCheckOut)
  );
  const [guests, setGuests] = useState(initialGuests || 1);

  const handleCheckInChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-in date cannot be in the past.");
        return;
      }
      if (checkOutDate && (isBefore(checkOutDate, date) || isSameDay(checkOutDate, date))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        setCheckOutDate(addDays(date, 1));
      } else if (!checkOutDate) {
        setCheckOutDate(addDays(date, 1));
      }
    }
    setCheckInDate(date);
  };

  const handleCheckOutChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-out date cannot be in the past.");
        return;
      }
      if (checkInDate && (isBefore(date, checkInDate) || isSameDay(date, checkInDate))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        return;
      }
    }
    setCheckOutDate(date);
  };

  // Booking for someone else toggle
  const [bookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);

  // Guest details
  const [guest, setGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [specialRequests, setSpecialRequests] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Notify user via sonner toast if redirected back with a payment error
  useEffect(() => {
    if (initialError === "payment_failed") {
      errorToast("Payment Failed", "Previous payment attempt failed or was declined. Please try again.");
    } else if (initialError === "payment_expired") {
      errorToast("Reservation Expired", "The 15-minute reservation hold expired. Please initiate a new booking.");
    } else if (initialError === "payment_validation_failed") {
      errorToast("Payment Error", "Payment validation could not be completed. Please contact support if charged.");
    }
  }, [initialError]);

  // Fetch actual room data from backend
  useEffect(() => {
    let isMounted = true;
    async function loadRoom() {
      if (!roomId) {
        setLoadingRoom(false);
        return;
      }
      try {
        setLoadingRoom(true);
        const res = await apiFetch(`/api/rooms/${roomId}`);
        if (res.ok) {
          const data: Room = await res.json();
          if (isMounted) {
            setRoom(data);
            setGuests((prev) =>
              Math.min(Math.max(prev || 1, 1), data.capacity || 1)
            );
          }
        } else {
          if (isMounted) setRoom(null);
        }
      } catch (err) {
        console.error("Failed to load room for checkout:", err);
        if (isMounted) setRoom(null);
      } finally {
        if (isMounted) setLoadingRoom(false);
      }
    }

    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // Fetch user profile and autofill when booking for self
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!isAuthenticated || bookingForSomeoneElse) return;

      try {
        const res = await apiFetch("/api/profile");
        if (res.ok) {
          const profile = await res.json();
          if (isMounted) {
            const fullName = profile.name || user?.fullName || "";
            const parts = fullName.trim().split(" ");
            const firstName = parts[0] || "";
            const lastName = parts.slice(1).join(" ") || "";

            setGuest((prev) => ({
              ...prev,
              firstName: prev.firstName || firstName,
              lastName: prev.lastName || lastName,
              email: prev.email || profile.email || user?.email || "",
              phone: prev.phone || profile.phoneNumber || "",
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load profile for autofill:", err);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, bookingForSomeoneElse, user]);

  // Handle toggling between self and other person
  const handleBookingForSomeoneElseChange = (checked: boolean) => {
    setBookingForSomeoneElse(checked);
    if (checked) {
      // Clear fields for new guest
      setGuest({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
      infoToast("Guest Details", "Booking for someone else: please enter the guest's contact details.");
    } else {
      // Re-populate from current user
      if (user) {
        const parts = (user.fullName || "").trim().split(" ");
        setGuest({
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          email: user.email || "",
          phone: "",
        });
        infoToast("Personal Details", "Switched to personal booking: profile details autofilled.");
      }
    }
  };

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = checkOutDate.getTime() - checkInDate.getTime();
    if (diff <= 0) return 1;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  // Whole number BDT price calculations
  const pricePerNight = Math.round(room?.price || 100);
  const roomSubtotal = pricePerNight * nights;
  const taxes = 0; // Inclusive of all taxes or whole number
  const total = roomSubtotal + taxes;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    return formatDateToDDMMYYYY(date);
  };

  const updateGuest = (field: keyof typeof guest, val: string) => {
    setGuest((curr) => ({
      ...curr,
      [field]: val,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated) {
      infoToast("Sign In Required", "Please sign in or create an account to book this room.");
      openLogin();
      return;
    }

    if (!room) {
      errorToast("Room Selection", "Please select a valid room to continue.");
      return;
    }

    const isBookable =
      room.status !== "Maintenance" &&
      room.status !== "Blocked";

    if (!isBookable) {
      errorToast("Unavailable", "This room is currently out of service or unavailable for booking.");
      return;
    }

    const validation = validateStayDates(checkInDate, checkOutDate);
    if (!validation.isValid) {
      errorToast("Validation Error", validation.error || "Please select valid check-in and check-out dates.");
      return;
    }

    if (
      !guest.firstName.trim() ||
      !guest.lastName.trim() ||
      !guest.email.trim() ||
      !guest.phone.trim()
    ) {
      errorToast(
        "Missing Info",
        bookingForSomeoneElse
          ? "Please provide the staying guest's first name, last name, email, and phone number."
          : "Please complete your name, email, and contact phone number."
      );
      return;
    }

    if (!acceptTerms) {
      errorToast("Terms & Policy", "Please accept the reservation terms and policy to proceed.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        roomId: room.id,
        checkInDate: formatDateToDDMMYYYY(checkInDate),
        checkOutDate: formatDateToDDMMYYYY(checkOutDate),
        guestsCount: guests,
        bookingForSomeoneElse,
        guestFirstName: guest.firstName.trim(),
        guestLastName: guest.lastName.trim(),
        guestEmail: guest.email.trim(),
        guestPhone: guest.phone.trim(),
        specialRequests: specialRequests.trim(),
        arrivalTime: arrivalTime.trim(),
      };

      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create reservation.");
      }

      if (data.gatewayPageUrl) {
        successToast("Reservation Lock", "15-minute hold active! Redirecting to payment...");
        // Redirect directly to SSLCommerz payment portal
        window.location.href = data.gatewayPageUrl;
      } else {
        throw new Error("Payment gateway could not be initiated.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      errorToast("Booking Error", err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingRoom) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading room details...
          </p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="hotel-display text-4xl font-semibold">
            Room not found
          </h1>
          <p className="mt-4 text-muted-foreground">
            We could not find the selected room. It may no longer be available.
          </p>
          <Link
            href="/rooms"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-medium text-primary-foreground"
          >
            <ArrowLeft className="size-4" />
            Browse all rooms
          </Link>
        </div>
      </main>
    );
  }

  const roomImage =
    room.images && room.images.length > 0
      ? room.images[0].imageUrl
      : DEFAULT_ROOM_IMAGE;

  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="hotel-container flex h-16 items-center justify-between">
          <Link
            href={`/rooms/${room.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to room details
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <LockKeyhole className="size-4 text-emerald-500" />
            SSLCommerz 256-Bit Encrypted Checkout
          </div>
        </div>
      </header>

      <div className="hotel-container py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Bangladeshi Taka (BDT)
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
              15-Minute Hold Protection
            </span>
          </div>

          <h1 className="hotel-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Complete your reservation
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Review your stay dates, verify guest details, and complete your
            payment securely via SSLCommerz.
          </p>
        </div>

        {/* Auth prompt if guest is not logged in */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <User className="size-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  Have an account?
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in to automatically fill in your details and view this booking in your profile.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openLogin}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Left Form column */}
            <div className="space-y-6">
              {/* Stay details */}
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <CalendarDays className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">Your stay details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Confirm your check-in, check-out dates, and number of guests.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Check-in</label>
                    <DatePicker
                      date={checkInDate}
                      onDateChange={handleCheckInChange}
                      minDate={new Date()}
                      placeholder="dd/mm/yyyy"
                      buttonClassName="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Check-out</label>
                    <DatePicker
                      date={checkOutDate}
                      onDateChange={handleCheckOutChange}
                      minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                      placeholder="dd/mm/yyyy"
                      buttonClassName="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Guests</label>
                    <Select
                      value={String(guests)}
                      onValueChange={(val) => setGuests(parseInt(val || "1", 10))}
                    >
                      <SelectTrigger className="h-11! w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between">
                        <SelectValue placeholder="1 guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: Math.max(1, room?.capacity || 1) },
                          (_, index) => index + 1
                        ).map((count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count} {count === 1 ? "guest" : "guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Guest information */}
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <User className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">Guest information</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Specify who will be staying in this room.
                    </p>
                  </div>
                </div>

                {/* Booking for someone else checkbox */}
                <div className="mt-6 rounded-2xl border border-border p-4 transition hover:border-primary/40">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={bookingForSomeoneElse}
                      onChange={(event) =>
                        handleBookingForSomeoneElseChange(event.target.checked)
                      }
                      className="mt-1 size-4 rounded accent-primary"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        I am booking for someone else
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        Check this box if the primary guest staying at the hotel
                        is someone other than yourself.
                      </span>
                    </span>
                  </label>
                </div>

                {bookingForSomeoneElse ? (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-5 text-amber-700 dark:text-amber-300">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="font-medium">Guest details required</p>
                      <p className="mt-0.5">
                        Please fill out the staying guest’s legal name, email, and
                        contact phone number below so hotel reception can welcome them.
                      </p>
                    </div>
                  </div>
                ) : (
                  isAuthenticated && (
                    <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <p className="font-medium">Auto-filled from your profile</p>
                        <p className="mt-0.5">
                          We pre-filled your details from your account. You can update them if needed.
                        </p>
                      </div>
                    </div>
                  )
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    First name <span className="text-destructive">*</span>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(event) =>
                        updateGuest("firstName", event.target.value)
                      }
                      placeholder="e.g. Rashedul"
                      required
                      className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Last name <span className="text-destructive">*</span>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(event) =>
                        updateGuest("lastName", event.target.value)
                      }
                      placeholder="e.g. Hasan"
                      required
                      className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Email address <span className="text-destructive">*</span>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        value={guest.email}
                        onChange={(event) =>
                          updateGuest("email", event.target.value)
                        }
                        placeholder="guest@example.com"
                        required
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </label>

                  <label className="text-sm font-medium">
                    Phone number <span className="text-destructive">*</span>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(event) =>
                          updateGuest("phone", event.target.value)
                        }
                        placeholder="+880 1XXXXXXXXX"
                        required
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </label>
                </div>
              </section>

              {/* Arrival & Requests */}
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
                <h2 className="text-lg font-semibold">Arrival & special requests</h2>

                <div className="mt-6 grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Estimated arrival time</label>
                    <Select
                      value={arrivalTime}
                      onValueChange={(val) => setArrivalTime(val || "")}
                    >
                      <SelectTrigger className="h-11! w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between">
                        <SelectValue placeholder="Select expected arrival time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12:00 - 14:00">12:00 PM – 2:00 PM</SelectItem>
                        <SelectItem value="14:00 - 16:00">2:00 PM – 4:00 PM</SelectItem>
                        <SelectItem value="16:00 - 18:00">4:00 PM – 6:00 PM</SelectItem>
                        <SelectItem value="18:00 - 20:00">6:00 PM – 8:00 PM</SelectItem>
                        <SelectItem value="20:00 - 22:00">8:00 PM – 10:00 PM</SelectItem>
                        <SelectItem value="22:00+">After 10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <label className="text-sm font-medium">
                    Special requests (Optional)
                    <textarea
                      value={specialRequests}
                      onChange={(event) =>
                        setSpecialRequests(event.target.value)
                      }
                      rows={3}
                      placeholder="e.g. Quiet room, late check-in, extra towels..."
                      className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* Payment Gateway: SSLCommerz */}
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <CreditCard className="size-4" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">Payment method</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Instant online checkout powered by SSLCommerz.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-primary bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">
                          SSLCommerz Gateway (BDT)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Debit/Credit Cards, bKash, Nagad, Rocket, Internet Banking
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>

                {/* 15-Minute Guaranteed Lock Callout */}
                <div className="mt-4 flex gap-3 rounded-2xl border border-primary/20 bg-secondary/40 p-4 text-xs leading-5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <span className="font-semibold text-foreground">
                      15-Minute Blocked Status Guarantee:
                    </span>{" "}
                    When you click proceed, this room is immediately locked for
                    15 minutes to prevent any other guest from reserving it while you
                    complete your payment on the secure SSLCommerz portal.
                  </div>
                </div>
              </section>

              {/* Terms & Conditions */}
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(event) => setAcceptTerms(event.target.checked)}
                    className="mt-1 size-4 rounded accent-primary"
                  />
                  <span className="text-sm leading-6 text-muted-foreground">
                    I agree to the Velora Hotels reservation policy, terms of
                    stay, and 15-minute temporary reservation lock.
                  </span>
                </label>
              </section>
            </div>

            {/* Right Summary column */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={roomImage}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="380px"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="rounded bg-black/40 px-2 py-0.5 text-xs uppercase font-semibold backdrop-blur">
                      {room.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h2 className="text-xl font-semibold">{room.name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {room.bedCount} {room.bedType} Bed{room.bedCount > 1 ? "s" : ""} • Up to {room.capacity} guests
                  </p>

                  <div className="mt-5 space-y-3 border-y border-border py-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium">{formatDate(checkInDate)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">{formatDate(checkOutDate)}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Stay length</span>
                      <span className="font-medium">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium">
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </span>
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        {formatCurrency(pricePerNight)} × {nights} night{nights === 1 ? "" : "s"}
                      </span>
                      <span className="font-medium">{formatCurrency(roomSubtotal)}</span>
                    </div>

                    <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                      <span>Taxes & fees</span>
                      <span>Included</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Total (BDT)</p>
                      <p className="text-xs text-muted-foreground">
                        Whole number currency
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(total)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || room?.status === "Maintenance" || room?.status === "Blocked"}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {room?.status === "Maintenance" || room?.status === "Blocked" ? (
                      "Room Currently Unavailable"
                    ) : submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Locking room & redirecting...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>SSLCommerz Secured Payment Gateway</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
                <p className="font-medium text-foreground">Booking Policy</p>
                <p className="mt-1">
                  Upon clicking Proceed, your room is held for 15 minutes. Once payment
                  is confirmed by SSLCommerz, your booking is finalized and linked to your guest details.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
