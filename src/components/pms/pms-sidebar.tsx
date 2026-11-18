"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-nav";
import { SidebarFooter } from "./sidebar-footer";
import { cn } from "@/lib/utils";

interface PMSSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function PMSSidebar({ isOpen, onClose, className }: PMSSidebarProps) {
  const sidebar = useSidebar();

  // If props are passed directly (e.g. from existing AdminShell), use them;
  // otherwise fallback to context state.
  const isMobileOpen = isOpen !== undefined ? isOpen : sidebar.isMobileOpen;
  const handleClose = onClose || sidebar.closeMobile;
  const isCollapsed = sidebar.isCollapsed;

  // Handle ESC key to close mobile sidebar
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, handleClose]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* =========================================================
          1. DESKTOP SIDEBAR (lg and above)
          ========================================================= */}
      <aside
        aria-label="Desktop PMS navigation"
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-border/60 bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out z-30 select-none",
          isCollapsed ? "w-20" : "w-68",
          className
        )}
      >
        <SidebarHeader />
        <SidebarNavigation />
        <SidebarFooter />
      </aside>

      {/* =========================================================
          2. MOBILE OFF-CANVAS DRAWER (< lg)
          ========================================================= */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile PMS navigation"
          className="fixed inset-0 z-50 lg:hidden"
        >
          {/* Backdrop overlay */}
          <button
            type="button"
            aria-label="Close mobile navigation"
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-76 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-left">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
              <SidebarHeader onCloseMobile={handleClose} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </Button>
            </div>

            <SidebarNavigation onItemClick={handleClose} />
            <SidebarFooter onCloseMobile={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}
