"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DashboardHeader } from "./dashboard-header";
import { DashboardKpiGrid } from "./dashboard-kpi-grid";
import { RoomStatusOverview } from "./room-status-overview";
import { ArrivalsDeparturesPanel } from "./arrivals-departures-panel";
import { UpcomingReservations } from "./upcoming-reservations";
import { RevenueOverview } from "./revenue-overview";
import { DepartmentOverviewGrid } from "./department-overview-grid";
import { RecentActivities } from "./recent-activities";
import { PendingActions } from "./pending-actions";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthContext";
import { usePermissions } from "@/lib/permissions/permission-context";
import { getDashboardOverview } from "@/lib/dashboard-api";
import type { DashboardOverviewResponse } from "@/types/dashboard";

export function DashboardContent() {
  const { user } = useAuth();
  const permissionCtx = usePermissions();

  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("today");

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await getDashboardOverview();
      setData(result.data);
      setIsLive(result.isLive);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data.";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derive authenticated user display name
  const displayName =
    user?.fullName ||
    data?.userContext.fullName ||
    "Hotel Manager";

  // Derive financial permissions: SuperAdmin, Admin, or users with financial permission keys
  const canViewFinancials =
    permissionCtx.isSuperAdmin ||
    permissionCtx.isAdmin ||
    permissionCtx.hasPermission("finance.view") ||
    permissionCtx.hasPermission("billing.view") ||
    permissionCtx.hasPermission("revenue.view") ||
    Boolean(data?.kpis.canViewFinancials);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center max-w-xl mx-auto space-y-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Unable to Load PMS Dashboard
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {error}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => loadDashboardData(false)}
          className="gap-2 rounded-xl"
        >
          <RefreshCw className="size-3.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* 1. Dashboard Header */}
      <DashboardHeader
        displayName={displayName}
        propertyTagline={data.propertyTagline}
        isLive={isLive}
        isRefreshing={isRefreshing}
        dateFilter={dateFilter}
        onDateFilterChange={(filter) => {
          setDateFilter(filter);
          loadDashboardData(true);
        }}
        onRefresh={() => loadDashboardData(true)}
      />

      {/* 2. Hotel Overview / Primary KPI Cards (8 KPI Cards) */}
      <DashboardKpiGrid
        kpis={data.kpis}
        canViewFinancials={canViewFinancials}
      />

      {/* 3. Attention Required / Pending Actions */}
      {data.pendingActions.length > 0 && (
        <PendingActions actions={data.pendingActions} />
      )}

      {/* 4. Room Status Overview (Segmented bar + category cards) */}
      <RoomStatusOverview
        roomStatuses={data.roomStatuses}
        totalRooms={data.kpis.totalPhysicalRooms}
      />

      {/* 5. Front Desk Operations: Today's Arrivals & Departures */}
      <ArrivalsDeparturesPanel
        arrivals={data.todaysArrivals}
        departures={data.todaysDepartures}
      />

      {/* 6. Upcoming Reservations Pipeline */}
      <UpcomingReservations reservations={data.upcomingReservations} />

      {/* 7. Financial Overview & Revenue Trend Visualizer */}
      <RevenueOverview
        financials={data.financials}
        canViewFinancials={canViewFinancials}
      />

      {/* 8. Operational Department Overview (Housekeeping, Maintenance, F&B, Inventory) */}
      <DepartmentOverviewGrid departments={data.departments} />

      {/* 9. Recent Operational Activities Audit Feed */}
      <RecentActivities activities={data.recentActivities} />
    </div>
  );
}
