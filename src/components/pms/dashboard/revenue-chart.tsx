"use client";

import React, { useState } from "react";
import { formatBDT } from "@/lib/dashboard-api";
import { cn } from "@/lib/utils";
import type { RevenueTrendPoint } from "@/types/dashboard";

interface RevenueChartProps {
  dailyTrends: RevenueTrendPoint[];
  weeklyTrends: RevenueTrendPoint[];
  monthlyTrends: RevenueTrendPoint[];
}

export function RevenueChart({
  dailyTrends,
  weeklyTrends,
  monthlyTrends,
}: RevenueChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activePoints =
    period === "daily"
      ? dailyTrends
      : period === "weekly"
      ? weeklyTrends
      : monthlyTrends;

  // Compute maximum revenue for chart scale
  const maxRevenue = Math.max(
    ...activePoints.map((p) => p.totalRevenue),
    10000
  );

  return (
    <div className="space-y-4">
      {/* View Period Selector & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Period switcher */}
        <div className="flex items-center rounded-xl border border-border/70 bg-background/80 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setPeriod("daily");
              setHoveredIndex(null);
            }}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              period === "daily"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Daily (7 Days)
          </button>
          <button
            type="button"
            onClick={() => {
              setPeriod("weekly");
              setHoveredIndex(null);
            }}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              period === "weekly"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Weekly (4 Weeks)
          </button>
          <button
            type="button"
            onClick={() => {
              setPeriod("monthly");
              setHoveredIndex(null);
            }}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
              period === "monthly"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly (6 Months)
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary" />
            <span className="text-muted-foreground">Room Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground">F&B Service Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 bg-amber-500 rounded-full" />
            <span className="text-muted-foreground">Occupancy %</span>
          </div>
        </div>
      </div>

      {/* SVG Bar & Line Chart Container with responsive horizontal scroll on mobile */}
      <div className="w-full overflow-x-auto pb-3 pt-6 scrollbar-thin">
        <div className="min-w-[560px] sm:min-w-0 w-full relative">
          {/* Active hover tooltip */}
          {hoveredIndex !== null && activePoints[hoveredIndex] && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-xl border border-border/80 bg-popover px-3 py-1.5 shadow-md text-xs text-popover-foreground transition-all duration-200">
              <span className="font-bold text-foreground">
                {activePoints[hoveredIndex].periodLabel}
              </span>
              <span className="text-border">•</span>
              <span>Total: <strong>{formatBDT(activePoints[hoveredIndex].totalRevenue)}</strong></span>
              <span className="text-border">•</span>
              <span className="text-primary font-medium">Room: {formatBDT(activePoints[hoveredIndex].roomRevenue)}</span>
              <span className="text-border">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">F&B: {formatBDT(activePoints[hoveredIndex].serviceRevenue)}</span>
              <span className="text-border">•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{activePoints[hoveredIndex].occupancyRate}% Occ</span>
            </div>
          )}

          {/* Bars Container */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 pt-8 pb-4 border-b border-border/60">
            {activePoints.map((point, idx) => {
              const isHovered = hoveredIndex === idx;
              const roomHeight = (point.roomRevenue / maxRevenue) * 100;
              const serviceHeight = (point.serviceRevenue / maxRevenue) * 100;
              const totalHeight = Math.min(100, roomHeight + serviceHeight);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                >
                  {/* Visual stacked bar */}
                  <div
                    className={cn(
                      "w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-xs",
                      isHovered ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "opacity-90 hover:opacity-100"
                    )}
                    style={{ height: `${Math.max(8, totalHeight)}%` }}
                  >
                    {/* Service Rev (Top portion) */}
                    <div
                      style={{ height: `${(serviceHeight / (totalHeight || 1)) * 100}%` }}
                      className="w-full bg-emerald-500/90 transition-colors"
                    />
                    {/* Room Rev (Bottom portion) */}
                    <div
                      style={{ height: `${(roomHeight / (totalHeight || 1)) * 100}%` }}
                      className="w-full bg-primary transition-colors"
                    />
                  </div>

                  {/* Bottom X-Axis Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        "block text-[11px] font-medium transition-colors",
                        isHovered ? "text-primary font-bold" : "text-muted-foreground"
                      )}
                    >
                      {point.periodLabel}
                    </span>
                    <span className="block text-[10px] text-muted-foreground/80 font-mono">
                      {formatBDT(point.totalRevenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="sm:hidden text-right">
        <span className="text-[10px] text-muted-foreground/70">← Swipe chart to view all dates →</span>
      </div>
    </div>
  );
}
