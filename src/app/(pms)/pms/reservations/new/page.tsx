"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  LogIn,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRooms, type Room } from "@/lib/admin-rooms-api";
import { createStaffReservation, type StaffCreateBookingInput } from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

export default function NewReservationPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [roomId, setRoomId] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>(today);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrow);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [arrivalTime, setArrivalTime] = useState<string>("14:00");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Paid");
  const [status, setStatus] = useState<"Confirmed" | "CheckedIn">("Confirmed");

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await getRooms({ pageSize: 100 });
      setRooms(res.rooms || []);
      if (res.rooms?.length) {
        const firstAvailable = res.rooms.find((r) => r.status.toLowerCase() === "available") || res.rooms[0];
        setRoomId(firstAvailable.id);
      }
    } catch (err) {
      console.warn("Failed to load rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);

  // Calculations
  const checkInMs = new Date(checkInDate).getTime();
  const checkOutMs = new Date(checkOutDate).getTime();
  const calculatedNights = Math.max(1, Math.round((checkOutMs - checkInMs) / (1000 * 60 * 60 * 24)));
  const calculatedTotal = (selectedRoom?.price || 0) * calculatedNights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId) {
      toast.error("Please select a room.");
      return;
    }
    if (!guestName.trim()) {
      toast.error("Please enter guest name.");
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: StaffCreateBookingInput = {
        roomId,
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount),
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, ".")}@guest.velora.com`,
        guestPhone: guestPhone.trim() || "+880 1700-000000",
        specialRequests: specialRequests.trim(),
        arrivalTime: arrivalTime.trim(),
        totalPrice: calculatedTotal,
        paymentMethod,
        paymentStatus,
        status,
      };

      await createStaffReservation(payload);
      toast.success(
        status === "CheckedIn"
          ? `Walk-in Guest ${guestName} checked in to Room #${selectedRoom?.roomNumber} successfully!`
          : `Reservation created for ${guestName} in Room #${selectedRoom?.roomNumber}!`
      );
      router.push("/pms/reservations");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/pms/reservations">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Front Office Walk-in / Booking
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              New Reservation Entry
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Guest Information */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">1. Guest Profile & Contact</h3>
              <p className="text-xs text-muted-foreground">Guest personal identification and contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground mb-1 block">Guest Full Name *</label>
              <Input
                required
                placeholder="e.g. Mahbubur Rahman"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Phone Number *</label>
              <Input
                required
                placeholder="+880 1700-112233"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Email Address (Optional)</label>
              <Input
                type="email"
                placeholder="guest@domain.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Expected Arrival Time</label>
              <Input
                placeholder="14:00 (Standard check-in)"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">Special Requests & Notes</label>
            <Textarea
              placeholder="Room preferences, transport assistance, high floor, honeymoon package..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={2}
              className="rounded-xl text-xs resize-none"
            />
          </div>
        </div>

        {/* Step 2: Room & Stay Selection */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">2. Stay Dates & Room Selection</h3>
              <p className="text-xs text-muted-foreground">Select stay dates and assign physical room unit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground mb-1 block">Check-In Date *</label>
              <Input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Check-Out Date *</label>
              <Input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Number of Guests</label>
              <Input
                type="number"
                min={1}
                max={selectedRoom?.capacity || 6}
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">Select Room Inventory *</label>
            {loadingRooms ? (
              <div className="flex items-center gap-2 p-3 border rounded-2xl text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading hotel room inventory...
              </div>
            ) : (
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-input bg-background px-3 py-2 text-xs shadow-xs"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} — {r.name} ({r.category}) • Floor {r.floor} • {formatBDT(r.price)}/night • {r.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedRoom && (
            <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-foreground text-sm">Room #{selectedRoom.roomNumber} - {selectedRoom.name}</span>
                <p className="text-muted-foreground mt-0.5">
                  Category: <span className="font-semibold text-foreground">{selectedRoom.category}</span> • Floor: {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Guests
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-border sm:pl-4">
                <span className="text-muted-foreground text-[11px] block">{calculatedNights} Night{calculatedNights > 1 ? "s" : ""}</span>
                <span className="text-lg font-extrabold text-primary">{formatBDT(calculatedTotal)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment & Workflow */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">3. Payment & Check-In Action</h3>
              <p className="text-xs text-muted-foreground">Front office settlement method and check-in status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground mb-1 block">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
              >
                <option value="Cash">Cash (Front Desk)</option>
                <option value="Credit Card">Credit Card (POS Terminal)</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Pay at Hotel">Pay at Check-Out</option>
                <option value="Bank Transfer">Bank Wire / Corporate</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as "Paid" | "Pending")}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
              >
                <option value="Paid">Paid / Settled</option>
                <option value="Pending">Pending / Balance Due</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Initial Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Confirmed" | "CheckedIn")}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
              >
                <option value="Confirmed">Confirmed Reservation</option>
                <option value="CheckedIn">Direct Check-In (In-House Now)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/pms/reservations">
            <Button type="button" variant="outline" className="rounded-xl text-xs">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={submitting || !roomId || !guestName.trim()}
            className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-6 h-10"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Reservation...
              </>
            ) : status === "CheckedIn" ? (
              <>
                <LogIn className="w-4 h-4" /> Check In Walk-in Guest Now
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm Front Office Booking
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
