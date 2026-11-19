"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  LogIn,
  LogOut,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { ArrivalItem, DepartureItem } from "@/types/dashboard";

interface ArrivalsDeparturesPanelProps {
  arrivals: ArrivalItem[];
  departures: DepartureItem[];
}

export function ArrivalsDeparturesPanel({
  arrivals,
  departures,
}: ArrivalsDeparturesPanelProps) {
  const [activeTab, setActiveTab] = useState<"arrivals" | "departures">("arrivals");

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Front Desk Operations
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time check-in and check-out queue for today
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center rounded-xl border border-border/70 bg-background/80 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("arrivals")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "arrivals"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LogIn className="size-3.5" />
            Today's Arrivals ({arrivals.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("departures")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "departures"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LogOut className="size-3.5" />
            Today's Departures ({departures.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Arrivals List */}
      {activeTab === "arrivals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing {arrivals.length} expected guest arrivals for today
            </span>
            <Link
              href="/pms/front-desk/arrivals"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              View all arrivals
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {arrivals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
              <LogIn className="size-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">No arrivals scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">
                There are no pending check-ins for the selected hotel date.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-background/50">
              {arrivals.map((item) => {
                const isCheckedIn = item.checkInStatus === "CheckedIn";
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
                  >
                    {/* Guest info & Room */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.guestName}
                        </span>
                        <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
                          {item.reservationNumber}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                            isCheckedIn
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              isCheckedIn ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                          {isCheckedIn ? "Checked In" : "Pending Check-In"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {item.assignedRoomNumber
                            ? `Room ${item.assignedRoomNumber} (${item.roomCategory})`
                            : item.roomCategory}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-primary" />
                          Arrival: {item.expectedArrivalTime || "Standard (14:00)"}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3 text-primary" />
                          {item.guestsCount} {item.guestsCount === 1 ? "Guest" : "Guests"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          {formatBDT(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <Link
                        href="/pms/reservations"
                        className="rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        View Folio
                      </Link>

                      {!isCheckedIn ? (
                        <Link
                          href="/pms/front-desk/check-in"
                          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                        >
                          Check In
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          In-House
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Departures List */}
      {activeTab === "departures" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing {departures.length} scheduled departures for today
            </span>
            <Link
              href="/pms/front-desk/departures"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              View all departures
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {departures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
              <LogOut className="size-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">No departures scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">
                There are no scheduled check-outs for the selected hotel date.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-background/50">
              {departures.map((item) => {
                const isCompleted = item.checkOutStatus === "Completed";
                const hasDue = item.outstandingBalance > 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
                  >
                    {/* Guest & Room */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.guestName}
                        </span>
                        <span className="font-mono text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/50">
                          {item.reservationNumber}
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                            isCompleted
                              ? "bg-muted text-muted-foreground border-border/60"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              isCompleted ? "bg-muted-foreground" : "bg-amber-500"
                            )}
                          />
                          {isCompleted ? "Checked Out" : "Awaiting Check-Out"}
                        </span>

                        {hasDue && (
                          <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold">
                            Balance Due: {formatBDT(item.outstandingBalance)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {item.assignedRoomNumber ? `Room ${item.assignedRoomNumber}` : "Room Unassigned"} ({item.roomCategory})
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-primary" />
                          Departure: {item.departureTime || "Standard (12:00)"}
                        </span>
                        <span>•</span>
                        <span>Folio: <strong className="text-foreground">{item.folioStatus}</strong></span>
                        <span>•</span>
                        <span>Total Stay: <strong>{formatBDT(item.totalPrice)}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <Link
                        href="/pms/reservations"
                        className="rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        View Folio
                      </Link>

                      {!isCompleted ? (
                        <Link
                          href="/pms/front-desk/check-out"
                          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                        >
                          Check Out
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <CheckCircle2 className="size-3.5" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
