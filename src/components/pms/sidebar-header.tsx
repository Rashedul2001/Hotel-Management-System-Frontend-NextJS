"use client";

import Link from "next/link";
import { Hotel } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

export function SidebarHeader({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border/60 px-3 transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "px-3"
      )}
    >
      <Link
        href="/pms/dashboard"
        onClick={onCloseMobile}
        className={cn(
          "group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
          isCollapsed && "justify-center w-auto"
        )}
        title="Hotel Velora PMS"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Hotel className="size-5" />
        </div>

        {!isCollapsed && (
          <div className="flex min-w-0 flex-col overflow-hidden">
            <span className="truncate font-semibold tracking-tight text-foreground text-sm leading-tight">
              Hotel Velora
            </span>
            <span className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              PMS Command Center
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
