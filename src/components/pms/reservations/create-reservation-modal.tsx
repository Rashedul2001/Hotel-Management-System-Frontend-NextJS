"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  Clock,
  CreditCard,
  Bed,
  CheckCircle2,
  LogIn,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRooms, type Room } from "@/lib/admin-rooms-api";
import { createStaffReservation, type StaffCreateBookingInput } from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultStatus?: "Confirmed" | "CheckedIn";
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onSuccess,
  defaultStatus = "Confirmed",
}: CreateReservationModalProps) {
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
  const [status, setStatus] = useState<"Confirmed" | "CheckedIn">(defaultStatus);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await getRooms({ pageSize: 100 });
      setRooms(res.rooms || []);
      if (res.rooms?.length && !roomId) {
        // Pick first available room
        const firstAvailable = res.rooms.find((r) => r.status.toLowerCase() === "available") || res.rooms[0];
        setRoomId(firstAvailable.id);
      }
    } catch (err) {
      console.warn("Failed to load rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoom = rooms.find((r) => r.id === roomId);

  // Calculate nights
  const checkInMs = new Date(checkInDate).getTime();
  const checkOutMs = new Date(checkOutDate).getTime();
  const calculatedNights = Math.max(1, Math.round((checkOutMs - checkInMs) / (1000 * 60 * 60 * 24)));
  const calculatedTotal = (selectedRoom?.price || 0) * calculatedNights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId) {
      toast.error("Please select an available room.");
      return;
    }

    if (!guestName.trim()) {
      toast.error("Please enter the guest full name.");
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
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Front Office: New Reservation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a walk-in, phone, or manual front desk booking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Section 1: Guest Information */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> 1. Guest Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Guest Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Tariqul Islam"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Phone Number *</label>
                <Input
                  required
                  placeholder="+880 1700-123456"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Email Address (Optional)</label>
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Expected Arrival Time</label>
                <Input
                  placeholder="14:00 (Standard)"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Special Requests / Preferences</label>
              <Textarea
                placeholder="High floor, extra towels, airport transport, quiet room..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                className="rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Room & Stay Dates */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-primary" /> 2. Room & Stay Period
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Check-In Date *</label>
                <Input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Check-Out Date *</label>
                <Input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Guests Count</label>
                <Input
                  type="number"
                  min={1}
                  max={selectedRoom?.capacity || 6}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Select Room *</label>
              {loadingRooms ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 border rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading room inventory...
                </div>
              ) : (
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room #{r.roomNumber} — {r.name} ({r.category}) • {formatBDT(r.price)}/night • {r.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedRoom && (
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">Room #{selectedRoom.roomNumber} - {selectedRoom.name}</span>
                  <p className="text-[11px] text-muted-foreground">
                    Category: {selectedRoom.category} • Floor {selectedRoom.floor} • Capacity: {selectedRoom.capacity} Guests
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">{calculatedNights} Night{calculatedNights > 1 ? "s" : ""}</span>
                  <p className="font-bold text-sm text-primary">{formatBDT(calculatedTotal)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Payment & Initial Status */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" /> 3. Payment & Check-In Workflow
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
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
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
                >
                  <option value="Paid">Paid / Settled</option>
                  <option value="Pending">Pending / Balance Due</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Confirmed" | "CheckedIn")}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
                >
                  <option value="Confirmed">Confirmed Reservation</option>
                  <option value="CheckedIn">Direct Check-In (In-House Now)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting || !roomId || !guestName.trim()}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs px-5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating Reservation...
                </>
              ) : status === "CheckedIn" ? (
                <>
                  <LogIn className="w-3.5 h-3.5" /> Complete Walk-in Check-In
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Reservation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
