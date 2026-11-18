"use client";

import Link from "next/link";
import { LogOut, User, Activity } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarFooter({
  onCloseMobile,
}: {
  onCloseMobile?: () => void;
}) {
  const { user, logout } = useAuth();
  const { isCollapsed } = useSidebar();

  const handleLogout = async () => {
    onCloseMobile?.();
    await logout();
  };

  const displayName = user?.fullName || "Hotel Staff";
  const userRole = user?.roles?.[0] || "Staff";

  return (
    <div className="shrink-0 border-t border-border/60 p-2.5 space-y-2">
      {/* System Status Pill */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between rounded-lg bg-accent/40 px-2.5 py-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="size-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">Velora PMS</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Online
          </span>
        </div>
      ) : (
        <div className="flex justify-center" title="Velora PMS Online">
          <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
        </div>
      )}

      {/* User Section & Profile / Logout */}
      <div
        className={cn(
          "flex items-center gap-2",
          isCollapsed ? "flex-col justify-center" : "justify-between"
        )}
      >
        <Link
          href="/profile"
          onClick={onCloseMobile}
          className={cn(
            "group flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-accent/60 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCollapsed && "justify-center p-2"
          )}
          title={isCollapsed ? `${displayName} (${userRole}) - My Profile` : "View Profile"}
        >
          <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {!isCollapsed && (
            <div className="flex min-w-0 flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-semibold text-foreground leading-tight">
                {displayName}
              </span>
              <span className="truncate text-[10px] text-muted-foreground font-medium">
                {userRole}
              </span>
            </div>
          )}
        </Link>

        {/* Action Buttons */}
        <div className={cn("flex items-center", isCollapsed ? "flex-col gap-1" : "gap-1")}>
          {!isCollapsed && (
            <Link
              href="/profile"
              onClick={onCloseMobile}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="My Profile"
              aria-label="My Profile"
            >
              <User className="size-3.5" />
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleLogout}
            className="size-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
