"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { useAuthModal } from "../../providers/auth-modal-context";
import { useAuth } from "@/providers/AuthContext";
import { ROLES } from "@/lib/roles";

import {
  FiSun,
  FiMoon,
  FiBell,
  FiLogOut,
  FiHome,
  FiGrid,
  FiImage,
  FiMail,
  FiCalendar,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import NotificationModal from "./NotificationModal";
import { Skeleton } from "../ui/skeleton";

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: FiHome,
  },
  {
    label: "Rooms",
    href: "/rooms",
    icon: FiGrid,
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: FiImage,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: FiMail,
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Navbar() {
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const { openLogin } = useAuthModal();
  const { user, isAuthenticated, logout, isLoading, hasAnyRole } = useAuth();
  const canAccessDashboard = hasAnyRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((value) => !value);
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    closeMobileMenu();
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userInitial = user?.email?.trim().charAt(0).toUpperCase() || "U";

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close mobile menu"
          onClick={closeMobileMenu}
          className="lg:hidden z-40 fixed inset-0 bg-black/40 backdrop-blur-sm"
        />
      )}

      <header className="top-0 z-50 sticky bg-background/90 shadow-sm backdrop-blur-xl border-border/60 border-b w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
          <div className="flex justify-between items-center gap-4 h-18 min-h-18">
            {/* ---------------------------------------------------------------- */}
            {/* Logo                                                             */}
            {/* ---------------------------------------------------------------- */}

            <Link
              href="/"
              className="group flex items-center gap-2.5 shrink-0"
              aria-label="Velora Hotels home"
            >
              <div className="flex justify-center items-center bg-primary shadow-sm rounded-xl w-10 h-10 text-primary-foreground group-hover:scale-105 transition-transform duration-300">
                <span className="font-semibold text-lg hotel-display">V</span>
              </div>

              <div className="flex flex-col leading-none">
                <span className="font-semibold text-foreground text-xl sm:text-2xl tracking-tight hotel-display">
                  Velora
                </span>

                <span className="mt-1 font-medium text-[9px] text-muted-foreground uppercase tracking-[0.28em]">
                  Hotels & Suites
                </span>
              </div>
            </Link>

            {/* ---------------------------------------------------------------- */}
            {/* Desktop Navigation                                               */}
            {/* ---------------------------------------------------------------- */}

            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="w-4 h-4" />

                    <span>{item.label}</span>

                    {active && (
                      <span className="bottom-0 left-1/2 absolute bg-primary rounded-full w-5 h-0.5 -translate-x-1/2" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ---------------------------------------------------------------- */}
            {/* Right Actions                                                     */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme */}
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="relative flex justify-center items-center bg-background hover:bg-primary/5 border border-border hover:border-primary/40 rounded-full w-10 h-10 transition-all duration-200"
              >
                <FiSun className="w-4.5 h-4.5 text-amber-500 dark:rotate-90 dark:scale-0 transition-all" />

                <FiMoon className="absolute w-4.5 h-4.5 text-slate-400 rotate-90 dark:rotate-0 scale-0 dark:scale-100 transition-all" />
              </button>

              {/* Notifications */}
              {isLoading ? (
                <Skeleton className="hidden md:flex rounded-full size-10 shrink-0" />
              ) : (
                isAuthenticated && (
                  <button
                    type="button"
                    aria-label="Open notifications"
                    onClick={() => setNotifOpen(true)}
                    className="hidden relative md:flex justify-center items-center bg-background hover:bg-primary/5 border border-border hover:border-primary/40 rounded-full w-10 h-10 hover:text-primary transition-all duration-200"
                  >
                    <FiBell className="w-4.5 h-4.5" />

                    <span className="top-2 right-2.5 absolute bg-primary rounded-full ring-2 ring-background w-2 h-2" />
                  </button>
                )
              )}

              {/* Auth */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        className="hover:bg-primary/5 p-0 rounded-full h-10"
                        aria-label="Open account menu"
                      >
                        <Avatar className="border border-primary/20 w-10 h-10">
                          <AvatarImage
                            src={user?.profilePictureUrl ?? ""}
                            alt={user?.fullName || "User"}
                          />

                          <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-sm">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    }
                  />

                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="p-1.5 rounded-xl w-56"
                  >
                    <div className="px-3 py-2.5">
                      <p className="font-semibold text-sm truncate">
                        {user?.fullName || "Guest"}
                      </p>

                      <p className="text-muted-foreground text-xs truncate">
                        {user?.email || "Velora guest"}
                      </p>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        render={
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 w-full cursor-pointer"
                          />
                        }
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </DropdownMenuItem>

                      {canAccessDashboard && (
                        <DropdownMenuItem
                          render={
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-2 w-full cursor-pointer"
                            />
                          }
                        >
                          <FiGrid className="w-4 h-4" />
                          Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        render={
                          <Link
                            href="/rooms"
                            className="flex items-center gap-2 w-full cursor-pointer"
                          />
                        }
                      >
                        <FiCalendar className="w-4 h-4" />
                        Book a Room
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setNotifOpen(true)} className={"cursor-pointer md:hidden"}>
                      <FiBell className="w-4 h-4" />
                      Notification
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={logout}
                    >
                      <FiLogOut className="w-4 h-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isLoading ? (
                <Skeleton className="mr-0.5 rounded-full size-10 shrink-0" />
              ) : (
                <Button
                  type="button"
                  size={"lg"}
                  onClick={openLogin}
                  className="hidden md:flex bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md px-5 rounded-full font-semibold text-primary-foreground transition-all duration-200"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                onClick={toggleMobileMenu}
                className="lg:hidden flex justify-center items-center bg-background hover:bg-primary/5 border border-border hover:border-primary/40 rounded-full w-10 h-10 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-5 h-5" />
                ) : (
                  <FiMenu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* Mobile Navigation                                                    */}
        {/* -------------------------------------------------------------------- */}

        <div
          className={cn(
            "lg:hidden top-18 z-50 fixed inset-x-0 bg-background shadow-xl border-border border-b transition-all duration-300",
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-4 opacity-0",
          )}
        >
          <div className="mx-auto px-4 sm:px-6 py-5 w-full max-w-7xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto">
            {/* Mobile links */}
            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex justify-between items-center px-4 py-3.5 rounded-xl font-medium text-base transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </span>

                    {active && (
                      <span className="opacity-80 font-medium text-xs">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Booking CTA */}
            <div className="bg-primary mt-5 p-5 rounded-2xl text-primary-foreground">
              <p className="font-semibold text-xl hotel-display">
                Your stay, your way.
              </p>

              <p className="mt-1 text-primary-foreground/75 text-sm">
                Discover rooms and experiences designed for a memorable stay.
              </p>

              <Link
                href="/rooms"
                onClick={closeMobileMenu}
                className="flex justify-center items-center bg-background hover:bg-background/90 mt-4 px-4 py-2.5 rounded-lg font-semibold text-foreground text-sm transition"
              >
                Explore Rooms
              </Link>
            </div>

            {/* Mobile account */}
            <div className="mt-5 pt-5 border-border border-t">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 hover:bg-muted px-4 py-3 rounded-xl"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage
                        src={user?.profilePictureUrl ?? ""}
                        alt={user?.fullName || "User"}
                      />

                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user?.fullName || "Guest"}
                      </p>

                      <p className="text-muted-foreground text-xs">
                        View profile
                      </p>
                    </div>
                  </Link>

                  {canAccessDashboard && (
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 hover:bg-muted px-4 py-3 rounded-xl font-medium text-sm"
                    >
                      <FiGrid className="w-5 h-5" />
                      Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 hover:bg-destructive/10 px-4 py-3 rounded-xl w-full font-medium text-destructive text-sm text-left transition"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    openLogin();
                  }}
                  className="bg-primary py-6 rounded-xl w-full font-semibold text-primary-foreground"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </>
  );
}

export default Navbar;
