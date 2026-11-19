"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Bed,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getReservations,
  checkOutReservation,
  settlePayment,
  type Reservation,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { ReservationDetailsModal } from "@/components/pms/reservations/reservation-details-modal";
import { toast } from "sonner";

export default function CheckOutOperationsPage() {
  const [departures, setDepartures] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  // Modals
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchDepartures = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both departures and in-house guests who may request early/current checkout
      const [depList, inHouseList] = await Promise.all([
        getReservations({ view: "departures", limit: 100 }),
        getReservations({ view: "in-house", limit: 100 }),
      ]);

      // Combine unique by ID
      const map = new Map<string, Reservation>();
      depList.forEach((r) => map.set(r.id, r));
      inHouseList.forEach((r) => map.set(r.id, r));
      setDepartures(Array.from(map.values()));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load departures queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  const handleCheckOut = async (res: Reservation) => {
    try {
      setCheckingOutId(res.id);
      await checkOutReservation(res.id);
      toast.success(
        `Check-Out Completed! Guest ${res.guestName} checked out. Room #${res.roomNumber} is scheduled for Housekeeping.`
      );
      fetchDepartures();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setCheckingOutId(null);
    }
  };

  const handleFastSettle = async (res: Reservation) => {
    try {
      await settlePayment(res.id, "Cash");
      toast.success(`Folio for Room #${res.roomNumber} settled via Cash.`);
      fetchDepartures();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to settle payment");
    }
  };

  const filtered = departures.filter((item) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      item.guestName.toLowerCase().includes(term) ||
      item.guestPhone.toLowerCase().includes(term) ||
      item.confirmationNumber.toLowerCase().includes(term) ||
      (item.roomNumber && item.roomNumber.toString().includes(term))
    );
  });

  const dueCheckouts = filtered.filter(
    (r) => r.status.toLowerCase() !== "completed" && r.status.toLowerCase() !== "checked-out"
  );
  const completedCheckouts = filtered.filter(
    (r) => r.status.toLowerCase() === "completed" || r.status.toLowerCase() === "checked-out"
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/pms/front-desk">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <KeyRound className="h-4 w-4" /> Front Desk Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Express Check-Out Console
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Audit guest folios, settle outstanding billing balances, release room keys, and dispatch housekeeping cleaning.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pms/front-desk/cashier">
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-primary" /> Cashier Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Fast Search & Lookup Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-primary" /> Departure & Room Number Lookup
        </span>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Room Number (e.g. 101, 102), Guest Name, Phone, or Booking Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl h-11 text-xs"
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchDepartures}
            disabled={loading}
            className="rounded-2xl h-11 px-4 text-xs gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh Queue
          </Button>
        </div>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Compiling departures queue...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Due Checkouts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs">
                {dueCheckouts.length}
              </span>
              Guests Due for Check-Out Today & In-House
            </h3>

            {dueCheckouts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/60 text-muted-foreground text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="font-semibold text-foreground text-sm">No Departures Due</p>
                <p className="mt-1">All scheduled departures have been checked out.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dueCheckouts.map((item) => {
                  const isPaid = item.paymentStatus?.toLowerCase() === "paid";
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-2 rounded-2xl bg-amber-500/10 text-amber-600 font-black text-base">
                            #{item.roomNumber || "—"}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{item.guestName}</h4>
                            <span className="font-mono text-[11px] text-muted-foreground block">
                              {item.confirmationNumber}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPaid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {isPaid ? "Folio Settled" : "Balance Due"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-muted/30 border border-border/60">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Room Unit</span>
                          <span className="font-semibold text-foreground">{item.roomName} ({item.roomCategory})</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Standard Check-Out</span>
                          <span className="font-semibold text-foreground">12:00 Standard</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Stay Duration</span>
                          <span className="font-semibold text-foreground">{item.checkInDate} &rarr; {item.checkOutDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Total Charge</span>
                          <span className="font-bold text-primary">{formatBDT(item.totalPrice)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRes(item);
                              setDetailsOpen(true);
                            }}
                            className="rounded-xl text-xs h-9"
                          >
                            Folio Details
                          </Button>

                          {!isPaid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFastSettle(item)}
                              className="rounded-xl text-xs h-9 text-emerald-600 hover:bg-emerald-50"
                            >
                              Settle Cash
                            </Button>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleCheckOut(item)}
                          disabled={checkingOutId === item.id}
                          className="rounded-xl text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs h-9 px-4"
                        >
                          {checkingOutId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogOut className="w-3.5 h-3.5" />
                          )}
                          Check Out & Clean Room
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Checkouts Today */}
          {completedCheckouts.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                Completed Check-Outs Today ({completedCheckouts.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {completedCheckouts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedRes(item);
                      setDetailsOpen(true);
                    }}
                    className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{item.guestName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Room #{item.roomNumber} • Released for Housekeeping
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <ReservationDetailsModal
        reservation={selectedRes}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRefresh={fetchDepartures}
      />
    </div>
  );
}
