"use client";


import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  User,
  Home,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthContext";
import { useSidebar } from "./sidebar-context";
import { PMS_NAVIGATION } from "@/config/pms-navigation";
import { cn } from "@/lib/utils";

function emptySubscribe() {
  return () => {};
}

export function PMSTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toggleMobileOpen, toggleCollapse } = useSidebar();

  // Hydration-safe client-mounted check without cascading effect render
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Compute breadcrumbs from current route
  const getBreadcrumbs = () => {
    if (!pathname || pathname === "/pms" || pathname === "/pms/dashboard") {
      return [{ title: "Overview" }, { title: "Dashboard" }];
    }

    for (const group of PMS_NAVIGATION) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return [{ title: group.heading }, { title: item.title }];
        }
        if (item.children) {
          for (const child of item.children) {
            if (
              child.href === pathname ||
              pathname.startsWith(`${child.href}/`)
            ) {
              return [
                { title: group.heading },
                { title: item.title },
                { title: child.title },
              ];
            }
          }
        }
      }
    }

    // Fallback breadcrumb
    const segments = pathname.replace(/^\/(pms|admin)\/?/, "").split("/");
    return segments.map((seg) => ({
      title: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    }));
  };

  const breadcrumbs = getBreadcrumbs();
  const displayName = user?.fullName || "Hotel Staff";
  const userRole = user?.roles?.[0] || "Staff";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-md">
      {/* Left: Toggles & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={toggleMobileOpen}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </Button>

        {/* Desktop sidebar collapse toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden lg:flex text-muted-foreground hover:text-foreground rounded-xl"
          onClick={toggleCollapse}
          title="Toggle sidebar"
          aria-label="Toggle sidebar collapse"
        >
          <PanelLeft className="size-4.5" />
        </Button>

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumbs"
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/pms/dashboard"
            className="font-medium hover:text-foreground transition-colors"
          >
            PMS
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "font-semibold text-foreground"
                    : "hover:text-foreground transition-colors"
                }
              >
                {crumb.title}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Placeholder */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            readOnly
            placeholder="Search rooms, reservations, guests... (Cmd+K)"
            aria-label="Quick search (placeholder)"
            className="w-full h-9 rounded-xl border border-border/60 bg-accent/30 pl-9 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Theme & Profile */}
      <div className="flex items-center gap-2">
        {/* Notifications Icon with Mock Badge */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            )}
            aria-label="View notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-1 top-1 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-destructive" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-foreground">
                Notifications & Tasks
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                3 Pending
              </span>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-1 py-1 text-xs">
              <div className="rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer">
                <p className="font-medium text-foreground">
                  New Reservation Pending
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Deluxe Room #204 - Sarah Jenkins
                </p>
              </div>
              <div className="rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer">
                <p className="font-medium text-foreground">
                  Maintenance Request #108
                </p>
                <p className="text-[11px] text-muted-foreground">
                  AC filter check requested in Suite 401
                </p>
              </div>
              <div className="rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer">
                <p className="font-medium text-foreground">
                  Daily Night Audit Ready
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Reconciliation pending for closing shift
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/pms/notifications")}
              className="flex items-center justify-center rounded-lg py-1.5 text-center text-xs font-medium text-primary hover:bg-primary/5 cursor-pointer"
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Switcher */}
        {mounted && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        )}

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="User account menu"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden xl:flex flex-col text-left">
              <span className="truncate text-xs font-semibold text-foreground leading-tight">
                {displayName}
              </span>
              <span className="truncate text-[10px] text-muted-foreground font-medium">
                {userRole}
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5">
            {/* Account Info Header */}
            <div className="px-2 py-1.5 border-b border-border/40 mb-1">
              <p className="text-xs font-semibold text-foreground">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || "staff@hotelvelora.com"}
              </p>
              <span className="mt-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Role: {userRole}
              </span>
            </div>
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="size-4 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Home className="size-4 text-muted-foreground" />
              <span>Homepage</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/pms/settings")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>System Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
