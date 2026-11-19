"use client";

import React from "react";
import Link from "next/link";
import {
  Banknote,
  Coins,
  CreditCard,
  ExternalLink,
  Lock,
  PieChart,
  Receipt,
  Scale,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { RevenueChart } from "./revenue-chart";
import { formatBDT } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { FinancialOverview } from "@/types/dashboard";

interface RevenueOverviewProps {
  financials: FinancialOverview | null;
  canViewFinancials: boolean;
}

export function RevenueOverview({
  financials,
  canViewFinancials,
}: RevenueOverviewProps) {
  if (!canViewFinancials || !financials || !financials.canAccess) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Lock className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Financial Overview & Realized Revenue
              </h3>
              <p className="text-xs text-muted-foreground">
                Revenue reporting, payments, and ledger balances
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground border border-border/60 self-start sm:self-auto">
            <ShieldAlert className="size-3.5" />
            Protected Financial Domain
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
          <p className="text-sm font-semibold text-foreground">
            Administrative & Finance Permissions Required
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
            Revenue realizations, ADR, RevPAR, guest ledger balances, and expense
            analyses are restricted to SuperAdmin, Admin, and authorized Finance department
            personnel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="size-4" />
            </div>
            <h3 className="text-base md:text-lg font-bold tracking-tight text-foreground">
              Financial Overview & Revenue Analytics
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Realized revenue, payment collections, and accounting velocity in BDT (৳)
          </p>
        </div>

        <Link
          href="/pms/finance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
        >
          Open Finance Dashboard
          <ExternalLink className="size-3" />
        </Link>
      </div>

      {/* Grid of Key Financial Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Today's Realized Revenue */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Today's Realized</span>
            <Coins className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatBDT(financials.todaysRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Room: {formatBDT(financials.roomRevenue)} · F&B: {formatBDT(financials.serviceRevenue)}
          </p>
        </div>

        {/* Monthly Revenue (MTD) */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Monthly Revenue (MTD)</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatBDT(financials.monthlyRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Month-to-date collected volume
          </p>
        </div>

        {/* Total Payments Collected */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Payments Collected</span>
            <CreditCard className="size-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatBDT(financials.totalPaymentsCollected)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            SSLCommerz & Front Desk Cashier
          </p>
        </div>

        {/* Outstanding Guest Balances */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Outstanding Balances</span>
            <Receipt className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {formatBDT(financials.outstandingGuestBalances)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Folio balances due at checkout
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Operating Expenses</span>
            <Banknote className="size-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatBDT(financials.expenses)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Today's procurement & operations
          </p>
        </div>

        {/* Net Operating Profit */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Net Operating Profit</span>
            <Scale className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatBDT(financials.netOperatingProfit)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Collected minus expenses & refunds
          </p>
        </div>

        {/* Refunds Processed */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Refunds Processed</span>
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatBDT(financials.refunds)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Zero cancellations with refund today
          </p>
        </div>

        {/* Service F&B Revenue Share */}
        <div className="rounded-2xl border border-border/60 bg-background/60 p-4 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Service Revenue Share</span>
            <PieChart className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
            {Math.round(
              (financials.serviceRevenue / (financials.todaysRevenue || 1)) * 100
            )}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {formatBDT(financials.serviceRevenue)} of total revenue
          </p>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div className="pt-2">
        <RevenueChart
          dailyTrends={financials.dailyTrends}
          weeklyTrends={financials.weeklyTrends}
          monthlyTrends={financials.monthlyTrends}
        />
      </div>
    </div>
  );
}
