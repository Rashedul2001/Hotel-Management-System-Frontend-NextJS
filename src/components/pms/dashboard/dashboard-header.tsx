"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Calendar,
  Clock,
  Radio,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  displayName: string;
  propertyTagline?: string;
  isLive: boolean;
  isRefreshing: boolean;
  dateFilter: "today" | "week" | "month";
  onDateFilterChange: (filter: "today" | "week" | "month") => void;
  onRefresh: () => void;
}

export function DashboardHeader({
  displayName,
  propertyTagline = "Luxury Hospitality & PMS Command Center",
  isLive,
  isRefreshing,
  dateFilter,
  onDateFilterChange,
  onRefresh,
}: DashboardHeaderProps) {
  // Live clock for Bangladesh Standard Time (UTC+6)
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Good day");

  useEffect(() => {
    const updateTime = () => {
      // Calculate BST (UTC+6)
      const now = new Date();
      const bstTime = new Date(now.getTime() + (now.getTimezoneOffset() + 360) * 60000);

      const hours = bstTime.getHours();
      if (hours < 12) {
        setGreeting("Good morning");
      } else if (hours < 17) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }

      const timeString = bstTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const dateString = bstTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-card via-card/95 to-accent/20 p-6 md:p-8 shadow-xs">
      {/* Decorative backdrop glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-40 -bottom-16 size-48 rounded-full bg-accent/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Greeting & Property Info */}
        <div className="space-y-2">
          {/* Top badging */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Building2 className="size-3.5" />
              Hotel Velora · 50 Keys
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                isLive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              )}
            >
              <Radio className={cn("size-3", isLive ? "animate-pulse" : "")} />
              {isLive ? "Live PMS Backend Connected" : "Local Data Synchronized"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {greeting},{" "}
            <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
            {propertyTagline}. Here is the real-time operational overview, room
            inventory status, and financial health for Hotel Velora today.
          </p>

          {/* Clock & Hotel Timezone */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="size-3.5 text-primary" />
              {currentDate || "Wednesday, 18 November 2026"}
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-foreground font-semibold">
              <Clock className="size-3.5 text-primary" />
              {currentTime || "12:00:00 PM"} (BST / Asia/Dhaka)
            </span>
          </div>
        </div>

        {/* Right: Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
          {/* Quick Date Range Selector */}
          <div className="flex items-center rounded-xl border border-border/70 bg-background/80 p-1 shadow-xs backdrop-blur-xs">
            <button
              type="button"
              onClick={() => onDateFilterChange("today")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                dateFilter === "today"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onDateFilterChange("week")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                dateFilter === "week"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => onDateFilterChange("month")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                dateFilter === "month"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              This Month
            </button>
          </div>

          {/* Refresh Action */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl border-border/80 bg-background/80 hover:bg-accent/60 gap-2 text-xs font-medium shadow-xs"
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin text-primary")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
