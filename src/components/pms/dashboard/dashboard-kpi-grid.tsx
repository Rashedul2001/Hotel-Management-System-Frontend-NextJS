"use client";

import React from "react";
import {
  BarChart3,
  BedDouble,
  BookmarkCheck,
  CalendarCheck,
  Coins,
  DoorClosed,
  LogIn,
  LogOut,
  Percent,
  Receipt,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardKpiCard } from "./dashboard-kpi-card";
import { formatBDT, formatPercentage } from "@/lib/dashboard-api";
import type { HotelOverviewKpis } from "@/types/dashboard";

interface DashboardKpiGridProps {
  kpis: HotelOverviewKpis;
  canViewFinancials: boolean;
}

export function DashboardKpiGrid({ kpis, canViewFinancials }: DashboardKpiGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground">
            Property Performance Indicators
          </h2>
          <p className="text-xs text-muted-foreground">
            Live operational metrics, occupancy velocity, and financial health
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Physical Rooms */}
        <DashboardKpiCard
          title="Total Physical Rooms"
          value={kpis.totalPhysicalRooms}
          subtitle={`${kpis.sellableRooms} sellable · ${kpis.outOfServiceRooms} out of service`}
          icon={BedDouble}
          iconColorClass="text-sky-600 dark:text-sky-400 bg-sky-500/10"
          href="/pms/rooms"
          breakdown={[
            { label: "Available", value: kpis.availableRooms, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Occupied", value: kpis.occupiedRooms, color: "text-sky-600 dark:text-sky-400" },
            { label: "Out of Service", value: kpis.outOfServiceRooms, color: "text-rose-600 dark:text-rose-400" },
          ]}
        />

        {/* 2. Occupancy Rate */}
        <DashboardKpiCard
          title="Occupancy Rate"
          value={`${kpis.occupancyRate.toFixed(1)}%`}
          subtitle={`${kpis.occupiedRooms} occupied / ${kpis.sellableRooms} sellable rooms`}
          icon={Percent}
          iconColorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          href="/pms/calendar/availability"
          trend={{
            value: formatPercentage(kpis.occupancyChangePercentage, true),
            positive: kpis.occupancyChangePercentage >= 0,
            label: `vs yesterday (${kpis.occupancyRateYesterday.toFixed(1)}%)`,
          }}
          badge="In-House"
        />

        {/* 3. Today's Arrivals */}
        <DashboardKpiCard
          title="Today's Arrivals"
          value={kpis.todaysArrivalsTotal}
          subtitle="Check-in velocity for today"
          icon={LogIn}
          iconColorClass="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
          href="/pms/front-desk/arrivals"
          breakdown={[
            { label: "Checked In", value: kpis.todaysArrivalsCheckedIn, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pending", value: kpis.todaysArrivalsPending, color: "text-amber-600 dark:text-amber-400" },
          ]}
          badge="Front Desk"
        />

        {/* 4. Today's Departures */}
        <DashboardKpiCard
          title="Today's Departures"
          value={kpis.todaysDeparturesTotal}
          subtitle="Check-out & folio settlements"
          icon={LogOut}
          iconColorClass="text-amber-600 dark:text-amber-400 bg-amber-500/10"
          href="/pms/front-desk/departures"
          breakdown={[
            { label: "Checked Out", value: kpis.todaysDeparturesCheckedOut, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pending", value: kpis.todaysDeparturesPending, color: "text-rose-600 dark:text-rose-400" },
          ]}
          badge="Front Desk"
        />

        {/* 5. Active Reservations */}
        <DashboardKpiCard
          title="Active Reservations"
          value={kpis.activeReservationsCount}
          subtitle="Total active & upcoming pipeline"
          icon={BookmarkCheck}
          iconColorClass="text-purple-600 dark:text-purple-400 bg-purple-500/10"
          href="/pms/reservations"
          breakdown={[
            { label: "Confirmed", value: kpis.confirmedReservationsCount, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pending Pay", value: kpis.pendingReservationsCount, color: "text-amber-600 dark:text-amber-400" },
            { label: "Cancelled", value: kpis.cancelledReservationsCount, color: "text-muted-foreground" },
          ]}
        />

        {/* 6. Today's Realized Revenue */}
        <DashboardKpiCard
          title="Today's Revenue"
          value={formatBDT(kpis.todaysRealizedRevenue)}
          subtitle={
            canViewFinancials
              ? `${formatBDT(kpis.todaysRoomRevenue)} Room · ${formatBDT(kpis.todaysServiceRevenue)} Service`
              : "Financial access restricted"
          }
          icon={Coins}
          iconColorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          href={canViewFinancials ? "/pms/finance" : undefined}
          trend={
            canViewFinancials && kpis.revenueChangePercentage !== null
              ? {
                  value: formatPercentage(kpis.revenueChangePercentage, true),
                  positive: kpis.revenueChangePercentage >= 0,
                  label: "vs last week",
                }
              : undefined
          }
          isFinancialLocked={!canViewFinancials}
          badge="Realized"
        />

        {/* 7. Average Daily Rate (ADR) */}
        <DashboardKpiCard
          title="Average Daily Rate (ADR)"
          value={formatBDT(kpis.averageDailyRate)}
          subtitle="Room Revenue / Occupied Rooms"
          icon={Tag}
          iconColorClass="text-teal-600 dark:text-teal-400 bg-teal-500/10"
          href={canViewFinancials ? "/pms/finance" : undefined}
          isFinancialLocked={!canViewFinancials}
          badge="Pricing"
        />

        {/* 8. Revenue Per Available Room (RevPAR) */}
        <DashboardKpiCard
          title="RevPAR"
          value={formatBDT(kpis.revPar)}
          subtitle="Room Revenue / Sellable Rooms"
          icon={BarChart3}
          iconColorClass="text-cyan-600 dark:text-cyan-400 bg-cyan-500/10"
          href={canViewFinancials ? "/pms/finance" : undefined}
          isFinancialLocked={!canViewFinancials}
          badge="Efficiency"
        />
      </div>
    </div>
  );
}
