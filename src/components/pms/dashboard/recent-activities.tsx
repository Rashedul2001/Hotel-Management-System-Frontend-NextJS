"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Layers,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentActivityItem } from "@/types/dashboard";

interface RecentActivitiesProps {
  activities: RecentActivityItem[];
}

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  reservation: {
    icon: BookmarkCheck,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  checkin: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  checkout: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  payment: {
    icon: CreditCard,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  room_status: {
    icon: Layers,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  housekeeping: {
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  maintenance: {
    icon: Wrench,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  order: {
    icon: UtensilsCrossed,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered =
    filterType === "all"
      ? activities
      : activities.filter((a) => a.type === filterType);

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Recent Operational Activities
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit feed of transactions, check-ins, work orders, and front office events
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-colors",
              filterType === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType("checkin")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-colors",
              filterType === "checkin"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Check-Ins
          </button>
          <button
            type="button"
            onClick={() => setFilterType("payment")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-colors",
              filterType === "payment"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Payments
          </button>
          <button
            type="button"
            onClick={() => setFilterType("housekeeping")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-colors",
              filterType === "housekeeping"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Turnover
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const config = TYPE_ICONS[item.type] || {
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/10",
          };
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className="group flex items-start gap-3.5 rounded-2xl border border-border/50 bg-background/50 p-3.5 transition-all hover:bg-muted/40 hover:border-border/80"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  config.bg,
                  config.color
                )}
              >
                <Icon className="size-4" />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs">
                      {item.title}
                    </span>
                    {item.entityReference && (
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border/40">
                        {item.entityReference}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                    {item.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-muted-foreground font-medium">
                    By: <strong className="text-foreground">{item.staffOrGuestName}</strong>
                  </span>

                  {item.navigationHref && (
                    <Link
                      href={item.navigationHref}
                      className="inline-flex items-center gap-1 font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      View
                      <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
