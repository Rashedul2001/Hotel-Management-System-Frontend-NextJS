"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PendingActionAlert } from "@/types/dashboard";

interface PendingActionsProps {
  actions: PendingActionAlert[];
}

const SEVERITY_STYLES: Record<
  string,
  {
    border: string;
    bg: string;
    icon: React.ElementType;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  destructive: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5 hover:bg-rose-500/10",
    icon: AlertCircle,
    iconColor: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-300",
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-300",
  },
  info: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/5 hover:bg-sky-500/10",
    icon: Info,
    iconColor: "text-sky-600 dark:text-sky-400",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-700 dark:text-sky-300",
  },
  success: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-300",
  },
};

export function PendingActions({ actions }: PendingActionsProps) {
  if (actions.length === 0) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs text-center">
        <CheckCircle2 className="size-8 mx-auto text-emerald-500 mb-2" />
        <p className="text-sm font-semibold text-foreground">All queues cleared</p>
        <p className="text-xs text-muted-foreground mt-1">
          No urgent front desk, housekeeping, or engineering actions currently pending.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <BellRing className="size-4" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Attention Required
            </h3>
            <p className="text-xs text-muted-foreground">
              Priority operational bottlenecks requiring managerial or front office clearance
            </p>
          </div>
        </div>

        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {actions.length} Pending
        </span>
      </div>

      {/* Action alerts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => {
          const style = SEVERITY_STYLES[action.severity] || SEVERITY_STYLES.warning;
          const Icon = style.icon;

          return (
            <div
              key={action.id}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs",
                style.bg,
                style.border
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-4 shrink-0", style.iconColor)} />
                    <span className="text-xs font-bold text-foreground">
                      {action.title}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                      style.badgeBg,
                      style.badgeText
                    )}
                  >
                    {action.count}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Dept: <strong>{action.department}</strong>
                </span>

                <Link
                  href={action.actionHref}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {action.actionLabel}
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
