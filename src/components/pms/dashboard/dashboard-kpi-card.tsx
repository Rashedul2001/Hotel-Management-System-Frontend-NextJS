"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  value: string | number;
  color?: string; // e.g. "text-emerald-600 dark:text-emerald-400"
}

export interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string; // e.g. "text-primary bg-primary/10"
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
    label?: string;
  };
  breakdown?: BreakdownItem[];
  badge?: string;
  href?: string;
  isFinancialLocked?: boolean;
}

export function DashboardKpiCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-primary bg-primary/10",
  subtitle,
  trend,
  breakdown,
  badge,
  href,
  isFinancialLocked = false,
}: DashboardKpiCardProps) {
  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-300",
        href && "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Decorative ambient corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

      {/* Top row: Icon, Badges, Link indicator */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
            iconColorClass
          )}
        >
          <Icon className="size-5" />
        </div>

        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground border border-border/60">
              {badge}
            </span>
          )}

          {isFinancialLocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Lock className="size-2.5" />
              Restricted
            </span>
          )}

          {href && !isFinancialLocked && (
            <div className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:text-primary">
              <ChevronRight className="size-4" />
            </div>
          )}
        </div>
      </div>

      {/* Middle: Title & Big Metric */}
      <div className="mt-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>

        {isFinancialLocked ? (
          <div className="flex items-center gap-2 py-1">
            <Lock className="size-4 text-muted-foreground/60" />
            <span className="text-sm font-medium text-muted-foreground italic">
              Permission Required
            </span>
          </div>
        ) : (
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        )}

        {subtitle && (
          <p className="text-[11px] text-muted-foreground/80 leading-tight">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom: Trend or Breakdown */}
      <div className="mt-3 pt-3 border-t border-border/50">
        {trend && !isFinancialLocked ? (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                trend.positive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : trend.neutral
                  ? "bg-muted text-muted-foreground"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {trend.positive && <ArrowUpRight className="size-3" />}
              {!trend.positive && !trend.neutral && <ArrowDownRight className="size-3" />}
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-[11px] text-muted-foreground">
                {trend.label}
              </span>
            )}
          </div>
        ) : null}

        {breakdown && !isFinancialLocked && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="text-muted-foreground">{item.label}:</span>
                <span
                  className={cn(
                    "font-semibold text-foreground",
                    item.color
                  )}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (href && !isFinancialLocked) {
    return (
      <Link href={href} className="block focus:outline-none">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
