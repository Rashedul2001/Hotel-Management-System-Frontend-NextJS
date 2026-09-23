"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { useAuthModal } from "../../providers/auth-modal-context";
import { useAuth } from "@/providers/AuthContext";

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
  const { user, isAuthenticated, logout, isLoading } = useAuth();

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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <header className="sticky top-0 z-50 w-full border-b shadow-sm border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-18 min-h-18">
            {/* ---------------------------------------------------------------- */}
            {/* Logo                                                             */}
            {/* ---------------------------------------------------------------- */}

            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5"
              aria-label="Velora Hotels home"
            >
              <div className="flex items-center justify-center w-10 h-10 transition-transform duration-300 shadow-sm rounded-xl bg-primary text-primary-foreground group-hover:scale-105">
                <span className="text-lg font-semibold hotel-display">V</span>
              </div>

              <div className="flex flex-col leading-none">
                <span className="text-xl font-semibold tracking-tight hotel-display text-foreground sm:text-2xl">
                  Velora
                </span>

                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                  Hotels & Suites
                </span>
              </div>
            </Link>

            {/* ---------------------------------------------------------------- */}
            {/* Desktop Navigation                                               */}
            {/* ---------------------------------------------------------------- */}

            <nav
              className="items-center hidden gap-1 lg:flex"
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
                      "relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="w-4 h-4" />

                    <span>{item.label}</span>

                    {active && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
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
                className="relative flex items-center justify-center w-10 h-10 transition-all duration-200 border rounded-full border-border bg-background hover:border-primary/40 hover:bg-primary/5"
              >
                <FiSun className="h-4.5 w-4.5 text-amber-500 transition-all dark:scale-0 dark:rotate-90" />

                <FiMoon className="absolute h-4.5 w-4.5 scale-0 rotate-90 text-slate-400 transition-all dark:scale-100 dark:rotate-0" />
              </button>

              {/* Notifications */}
              {isLoading ? (
                <Skeleton className="hidden rounded-full size-10 shrink-0 md:flex " />
              ) : (
                isAuthenticated && (
                  <button
                    type="button"
                    aria-label="Open notifications"
                    onClick={() => setNotifOpen(true)}
                    className="relative items-center justify-center hidden w-10 h-10 transition-all duration-200 border rounded-full border-border bg-background hover:border-primary/40 hover:bg-primary/5 hover:text-primary md:flex"
                  >
                    <FiBell className="h-4.5 w-4.5" />

                    <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
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
                        className="h-10 p-0 rounded-full hover:bg-primary/5"
                        aria-label="Open account menu"
                      >
                        <Avatar className="w-10 h-10 border border-primary/20">
                          <AvatarImage
                            src={user?.profilePictureUrl ?? ""}
                            alt={user?.fullName || "User"}
                          />

                          <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    }
                  />

                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-56 rounded-xl p-1.5"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold truncate">
                        {user?.fullName || "Guest"}
                      </p>

                      <p className="text-xs truncate text-muted-foreground">
                        {user?.email || "Velora guest"}
                      </p>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        render={
                          <Link
                            href="/profile"
                            className="flex items-center w-full gap-2 cursor-pointer"
                          />
                        }
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        render={
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center w-full gap-2 cursor-pointer"
                          />
                        }
                      >
                        <FiGrid className="w-4 h-4" />
                        Dashboard
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        render={
                          <Link
                            href="/rooms"
                            className="flex items-center w-full gap-2 cursor-pointer"
                          />
                        }
                      >
                        <FiCalendar className="w-4 h-4" />
                        Book a Room
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuItem
                      render={
                        <button
                          onClick={() => setNotifOpen(true)}
                          className="flex items-center w-full gap-2 cursor-pointer"
                        />
                      }
                    >
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
                <Skeleton className="size-10 shrink-0 rounded-full mr-0.5" />
              ) : (
                <Button
                  type="button"
                  size={"lg"}
                  onClick={openLogin}
                  className="hidden px-5 font-semibold transition-all duration-200 rounded-full shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md md:flex"
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
                className="flex items-center justify-center w-10 h-10 transition-all duration-200 border rounded-full border-border bg-background hover:border-primary/40 hover:bg-primary/5 lg:hidden"
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
            "fixed inset-x-0 top-18 z-50 border-b border-border bg-background shadow-xl transition-all duration-300 lg:hidden",
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-4 opacity-0",
          )}
        >
          <div className="mx-auto max-h-[calc(100dvh-4.5rem)] w-full max-w-7xl overflow-y-auto px-4 py-5 sm:px-6">
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
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200",
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
                      <span className="text-xs font-medium opacity-80">
                        Current
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Booking CTA */}
            <div className="p-5 mt-5 rounded-2xl bg-primary text-primary-foreground">
              <p className="text-xl font-semibold hotel-display">
                Your stay, your way.
              </p>

              <p className="mt-1 text-sm text-primary-foreground/75">
                Discover rooms and experiences designed for a memorable stay.
              </p>

              <Link
                href="/rooms"
                onClick={closeMobileMenu}
                className="mt-4 flex items-center justify-center rounded-lg bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background/90"
              >
                Explore Rooms
              </Link>
            </div>

            {/* Mobile account */}
            <div className="pt-5 mt-5 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user?.profilePictureUrl ?? ""}
                        alt={user?.fullName || "User"}
                      />

                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user?.fullName || "Guest"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        View profile
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="admin/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-muted"
                  >
                    <FiGrid className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-left transition rounded-xl text-destructive hover:bg-destructive/10"
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
                  className="w-full py-6 font-semibold rounded-xl bg-primary text-primary-foreground"
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
