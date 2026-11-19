"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { formatBDT } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { DepartmentOverviews } from "@/types/dashboard";

interface DepartmentOverviewGridProps {
  departments: DepartmentOverviews;
}

export function DepartmentOverviewGrid({
  departments,
}: DepartmentOverviewGridProps) {
  const { housekeeping, maintenance, roomService, inventory } = departments;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground">
          Operational Department Status
        </h2>
        <p className="text-xs text-muted-foreground">
          Turnover efficiency, engineering work orders, guest dining orders, and inventory thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* =========================================================
            1. HOUSEKEEPING WIDGET
            ========================================================= */}
        {housekeeping.canAccess && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Housekeeping & Turnover
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Room cleaning velocity & inspections
                    </p>
                  </div>
                </div>

                <Link
                  href="/pms/housekeeping/tasks"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Tasks
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Status metric badges */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-amber-600 dark:text-amber-400">
                    {housekeeping.roomsRequiringCleaning}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Needing Clean
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-sky-600 dark:text-sky-400">
                    {housekeeping.roomsBeingCleaned}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    In Progress
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-purple-600 dark:text-purple-400">
                    {housekeeping.roomsAwaitingInspection}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Inspection
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {housekeeping.completedTasksToday}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Clean Today
                  </span>
                </div>
              </div>

              {/* Active Tasks Feed */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority Turnover Queue
                </div>

                <div className="space-y-1.5">
                  {housekeeping.activeTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-2.5 text-xs transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-foreground">
                          Room {task.roomNumber}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          ({task.roomCategory})
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.2 text-[10px] font-semibold",
                            task.priority === "Urgent"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-right text-[11px]">
                        <span className="text-muted-foreground">{task.assignedAttendant}</span>
                        <span className="font-medium text-foreground">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 border-t border-border/50">
              <Link
                href="/pms/housekeeping/tasks"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-accent/60 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Open Housekeeping Console
                <ExternalLink className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================
            2. MAINTENANCE WIDGET
            ========================================================= */}
        {maintenance.canAccess && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Wrench className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Engineering & Maintenance
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Equipment, HVAC, facilities & room repairs
                    </p>
                  </div>
                </div>

                <Link
                  href="/pms/maintenance/work-orders"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Work Orders
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Status metric badges */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-foreground">
                    {maintenance.openMaintenanceRequests}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Open Requests
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-amber-600 dark:text-amber-400">
                    {maintenance.inProgressWorkOrders}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    In Progress
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-rose-600 dark:text-rose-400">
                    {maintenance.criticalIssues}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Critical Issues
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {maintenance.recentlyCompleted}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Resolved (7d)
                  </span>
                </div>
              </div>

              {/* Critical & Open Issues Feed */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Work Orders
                </div>

                <div className="space-y-1.5">
                  {maintenance.criticalAndOpenIssues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-2.5 text-xs transition-colors hover:bg-muted/40"
                    >
                      <div className="space-y-0.5 max-w-[65%]">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.2 text-[10px] font-semibold",
                              issue.severity === "Critical"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            )}
                          >
                            {issue.severity}
                          </span>
                          <span className="font-semibold text-foreground truncate">
                            {issue.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {issue.location} · {issue.assignedTechnician}
                        </p>
                      </div>

                      <span className="font-medium text-foreground text-[11px]">
                        {issue.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 border-t border-border/50">
              <Link
                href="/pms/maintenance/work-orders"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-accent/60 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Open Maintenance System
                <ExternalLink className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================
            3. ROOM SERVICE & RESTAURANT WIDGET
            ========================================================= */}
        {roomService.canAccess && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <UtensilsCrossed className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Room Service & F&B
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Taking orders, kitchen preparation & room delivery
                    </p>
                  </div>
                </div>

                <Link
                  href="/pms/room-service/orders"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  All Orders
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Status metric badges */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-amber-600 dark:text-amber-400">
                    {roomService.pendingOrders}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    New Orders
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-sky-600 dark:text-sky-400">
                    {roomService.inProgressOrders}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    In Kitchen
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {roomService.deliveredOrders}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Delivered
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-foreground">
                    {formatBDT(roomService.totalFnbRevenueToday)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    F&B Revenue
                  </span>
                </div>
              </div>

              {/* Active Orders List */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Kitchen & Delivery Queue
                </div>

                <div className="space-y-1.5">
                  {roomService.activeOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-2.5 text-xs transition-colors hover:bg-muted/40"
                    >
                      <div className="space-y-0.5 max-w-[65%]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {order.destination}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                            {order.orderNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {order.itemsSummary}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="block font-bold text-foreground">
                          {formatBDT(order.totalAmount)}
                        </span>
                        <span
                          className={cn(
                            "inline-block text-[10px] font-semibold",
                            order.status === "Delivered"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {order.status} ({order.paymentStatus})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 border-t border-border/50">
              <Link
                href="/pms/room-service/orders"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-accent/60 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Open F&B Dispatch Console
                <ExternalLink className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================
            4. INVENTORY & PROCUREMENT WIDGET
            ========================================================= */}
        {inventory.canAccess && (
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Boxes className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Inventory & Procurement
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Stock levels, consumable alerts & reorder thresholds
                    </p>
                  </div>
                </div>

                <Link
                  href="/pms/inventory/low-stock"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Alerts
                  <ArrowRight className="size-3" />
                </Link>
              </div>

              {/* Status metric badges */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-amber-600 dark:text-amber-400">
                    {inventory.lowStockItems}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Low Stock
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-rose-600 dark:text-rose-400">
                    {inventory.outOfStockItems}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Out of Stock
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-purple-600 dark:text-purple-400">
                    {inventory.pendingPurchaseRequests}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Purchase Reqs
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-center">
                  <span className="block text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {inventory.pendingGoodsReceiving}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium">
                    Receiving
                  </span>
                </div>
              </div>

              {/* Critical Low Stock Items */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Critical Reorder Alerts
                </div>

                <div className="space-y-1.5">
                  {inventory.criticalStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-2.5 text-xs transition-colors hover:bg-muted/40"
                    >
                      <div className="space-y-0.5 max-w-[65%]">
                        <span className="font-semibold text-foreground truncate block">
                          {item.itemName}
                        </span>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={cn(
                            "inline-block rounded-md px-1.5 py-0.2 text-[10px] font-semibold",
                            item.stockStatus === "Out"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {item.currentStock} / {item.reorderThreshold} {item.unitOfMeasure}
                        </span>
                        <span className="block text-[9px] text-muted-foreground mt-0.5">
                          Threshold: {item.reorderThreshold}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 border-t border-border/50">
              <Link
                href="/pms/inventory/low-stock"
                className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-accent/60 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Open Inventory Stock Manager
                <ExternalLink className="size-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
