"use client";

import React from "react";
import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoomStatusDistribution } from "@/types/dashboard";

interface RoomStatusOverviewProps {
  roomStatuses: RoomStatusDistribution[];
  totalRooms: number;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  Available: CheckCircle2,
  Occupied: Users,
  Cleaning: Sparkles,
  Maintenance: Wrench,
  Blocked: Ban,
};

const STATUS_STYLES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    bar: string;
    dot: string;
    description: string;
  }
> = {
  Available: {
    bg: "bg-emerald-500/10 hover:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    description: "Vacant clean & ready for guest check-in",
  },
  Occupied: {
    bg: "bg-sky-500/10 hover:bg-sky-500/15",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/20",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    description: "In-house guests currently staying",
  },
  Cleaning: {
    bg: "bg-amber-500/10 hover:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    description: "Vacant dirty, turnover in progress",
  },
  Maintenance: {
    bg: "bg-purple-500/10 hover:bg-purple-500/15",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/20",
    bar: "bg-purple-500",
    dot: "bg-purple-500",
    description: "Technical repairs or scheduled maintenance",
  },
  Blocked: {
    bg: "bg-rose-500/10 hover:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    description: "Out-of-service / administrative hold",
  },
};

export function RoomStatusOverview({
  roomStatuses,
  totalRooms,
}: RoomStatusOverviewProps) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Room Status Inventory
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Physical room state distribution across all {totalRooms} rooms in Hotel Velora
          </p>
        </div>

        <Link
          href="/pms/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          Manage All Rooms
          <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* Segmented Visual Stacked Distribution Bar */}
      <div className="space-y-2">
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 shadow-inner">
          {roomStatuses.map((item) => {
            const style = STATUS_STYLES[item.status] || STATUS_STYLES.Available;
            if (item.count <= 0) return null;
            return (
              <div
                key={item.status}
                style={{ width: `${item.percentage}%` }}
                className={cn(
                  "h-full first:rounded-l-full last:rounded-r-full transition-all duration-500",
                  style.bar
                )}
                title={`${item.status}: ${item.count} rooms (${item.percentage}%)`}
              />
            );
          })}
        </div>

        {/* Legend dots */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {roomStatuses.map((item) => {
            const style = STATUS_STYLES[item.status] || STATUS_STYLES.Available;
            return (
              <div key={item.status} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", style.dot)} />
                <span className="text-muted-foreground">{item.status}:</span>
                <span className="font-semibold text-foreground">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {roomStatuses.map((item) => {
          const Icon = STATUS_ICONS[item.status] || Layers;
          const style = STATUS_STYLES[item.status] || STATUS_STYLES.Available;

          return (
            <Link
              key={item.status}
              href={item.navigationHref || "/pms/rooms"}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {item.status}
                </span>
                <Icon className={cn("size-4", style.text)} />
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {item.count}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  {item.percentage}% of rooms
                </div>
              </div>

              <div className="mt-2 text-[10px] text-muted-foreground line-clamp-1">
                {style.description}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
