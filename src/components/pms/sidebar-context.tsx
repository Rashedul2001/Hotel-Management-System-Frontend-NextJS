"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { PMS_NAVIGATION } from "@/config/pms-navigation";
import { isRouteActive } from "@/lib/pms-route-utils";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: () => void;

  isMobileOpen: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileOpen: () => void;
  closeMobile: () => void;

  openSubmenus: Record<string, boolean>;
  toggleSubmenu: (id: string) => void;
  isSubmenuOpen: (id: string) => boolean;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "velora_pms_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Desktop collapsed state with lazy initialization
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  // Accordion submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  // Quick filter query inside navigation
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSetIsCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  > = useCallback((action) => {
    setIsCollapsed((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  }, []);

  const toggleCollapse = useCallback(() => {
    handleSetIsCollapsed((prev) => !prev);
  }, [handleSetIsCollapsed]);

  const toggleMobileOpen = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const toggleSubmenu = useCallback((id: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isSubmenuOpen = useCallback(
    (id: string) => {
      return Boolean(openSubmenus[id]);
    },
    [openSubmenus]
  );

  // Automatically expand parent submenus when navigating to an active child route
  useEffect(() => {
    if (!pathname) return;

    // Close mobile drawer on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);

    // Find if current route matches any child
    const matchingParentIds: string[] = [];

    for (const group of PMS_NAVIGATION) {
      for (const item of group.items) {
        if (item.children && item.children.length > 0) {
          const hasActiveChild = item.children.some((child) =>
            isRouteActive(child.href, pathname)
          );

          const isItemActive = isRouteActive(item.href, pathname);

          if (hasActiveChild || isItemActive) {
            matchingParentIds.push(item.id);
          }
        }
      }
    }

    if (matchingParentIds.length > 0) {
      setOpenSubmenus((prev) => {
        const next = { ...prev };
        matchingParentIds.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
    }
  }, [pathname]);

  const value: SidebarContextValue = {
    isCollapsed,
    setIsCollapsed: handleSetIsCollapsed,
    toggleCollapse,
    isMobileOpen,
    setIsMobileOpen,
    toggleMobileOpen,
    closeMobile,
    openSubmenus,
    toggleSubmenu,
    isSubmenuOpen,
    searchQuery,
    setSearchQuery,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
