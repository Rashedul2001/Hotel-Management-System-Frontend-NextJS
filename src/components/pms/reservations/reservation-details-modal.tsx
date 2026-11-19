"use client";

import React, { useState } from "react";
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
  LogOut,
  RefreshCw,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Reservation,
  checkInReservation,
  checkOutReservation,
  cancelReservation,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

interface ReservationDetailsModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenReassign?: (reservation: Reservation) => void;
}

export function ReservationDetailsModal({
  reservation,
  isOpen,
  onClose,
  onRefresh,
  onOpenReassign,
}: ReservationDetailsModalProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen || !reservation) return null;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "checked-in":
      case "checkedin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <LogIn className="w-3.5 h-3.5" /> In-House (Checked-In)
          </span>
        );
      case "completed":
      case "checked-out":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <LogOut className="w-3.5 h-3.5" /> Completed (Checked-Out)
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case "no-show":
      case "noshow":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> No-Show
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Payment
          </span>
        );
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoadingAction("checkin");
      await checkInReservation(reservation.id);
      toast.success(`Guest ${reservation.guestName} successfully checked in to Room #${reservation.roomNumber || ""}.`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check in guest");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoadingAction("checkout");
      await checkOutReservation(reservation.id);
      toast.success(`Guest ${reservation.guestName} checked out. Room marked for housekeeping cleaning.`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to check out guest");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Are you sure you want to cancel reservation ${reservation.confirmationNumber} for ${reservation.guestName}?`)) {
      return;
    }
    try {
      setLoadingAction("cancel");
      await cancelReservation(reservation.id);
      toast.success(`Reservation ${reservation.confirmationNumber} cancelled.`);
      onRefresh();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel reservation");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {reservation.confirmationNumber}
                </h3>
                {getStatusBadge(reservation.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Front Office Folio & Stay Details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              title="Print Folio / Registration Card"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* Guest Profile Card */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Guest Details
              </span>
              {reservation.isBookingForSomeoneElse && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 font-medium">
                  Booked for third party
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Full Name</span>
                <p className="font-semibold text-foreground text-sm mt-0.5">
                  {reservation.guestName}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Email Address</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {reservation.guestEmail || "N/A"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Phone Number</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {reservation.guestPhone || "N/A"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Expected Arrival Time</span>
                <p className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {reservation.arrivalTime || "14:00 (Standard Check-in)"}
                </p>
              </div>
            </div>

            {reservation.specialRequests && (
              <div className="pt-2 border-t border-border/40 text-xs">
                <span className="text-muted-foreground font-medium">Special Requests & Preferences:</span>
                <p className="mt-1 p-2 rounded-xl bg-card border border-border/60 text-foreground italic">
                  &ldquo;{reservation.specialRequests}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Stay & Room Details Card */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-primary" /> Room & Stay Information
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {reservation.roomCategory || "Room"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Assigned Room</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  #{reservation.roomNumber || "Unassigned"}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Floor {reservation.floor || "—"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Check-In Date</span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {reservation.checkInDate}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Check-Out Date</span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {reservation.checkOutDate}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Duration</span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {reservation.nights} Night{reservation.nights > 1 ? "s" : ""}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {reservation.guestsCount} Guest{reservation.guestsCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs mt-2">
              <div>
                <span className="font-semibold text-foreground">{reservation.roomName}</span>
                <div className="text-[11px] text-muted-foreground">
                  Room Status: <span className="capitalize font-medium text-foreground">{reservation.roomStatus || "Available"}</span>
                </div>
              </div>
              {onOpenReassign && reservation.status.toLowerCase() !== "completed" && reservation.status.toLowerCase() !== "cancelled" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenReassign(reservation)}
                  className="rounded-xl text-xs gap-1.5 h-8"
                >
                  <ArrowRightLeft className="w-3 h-3" /> Transfer Room
                </Button>
              )}
            </div>
          </div>

          {/* Billing & Financial Folio */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Billing & Payment Folio
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                reservation.paymentStatus?.toLowerCase() === "paid"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}>
                {reservation.paymentStatus || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Total Charge</span>
                <p className="text-base font-extrabold text-foreground mt-0.5 text-primary">
                  {formatBDT(reservation.totalPrice)}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Payment Method</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {reservation.paymentMethod || "Pay at Hotel"}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">Transaction ID</span>
                <p className="font-mono text-[11px] text-foreground mt-0.5 truncate" title={reservation.transactionId || ""}>
                  {reservation.transactionId || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2">
            {reservation.status.toLowerCase() !== "completed" && reservation.status.toLowerCase() !== "cancelled" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={loadingAction !== null}
                className="rounded-xl text-xs gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel Stay
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* If Confirmed -> Offer Check-in */}
            {reservation.status.toLowerCase() === "confirmed" && (
              <Button
                size="sm"
                onClick={handleCheckIn}
                disabled={loadingAction !== null}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-xs"
              >
                {loadingAction === "checkin" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                Check In Guest
              </Button>
            )}

            {/* If CheckedIn -> Offer Check-out */}
            {(reservation.status.toLowerCase() === "checked-in" || reservation.status.toLowerCase() === "checkedin") && (
              <Button
                size="sm"
                onClick={handleCheckOut}
                disabled={loadingAction !== null}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-xs"
              >
                {loadingAction === "checkout" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                Check Out Guest
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
