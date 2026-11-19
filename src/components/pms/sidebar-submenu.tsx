"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSubItem } from "@/types/pms-navigation";
import { isRouteActive } from "@/lib/pms-route-utils";
import { cn } from "@/lib/utils";

interface SidebarSubmenuProps {
  items: NavSubItem[];
  isOpen: boolean;
  onItemClick?: () => void;
}

export function SidebarSubmenu({
  items,
  isOpen,
  onItemClick,
}: SidebarSubmenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <ul
      role="group"
      className="relative ml-5 mt-1 space-y-0.5 border-l border-border/60 pl-3.5"
    >
      {items.map((subItem) => {
        const isActive = isRouteActive(subItem.href, pathname, true);

        return (
          <li key={subItem.id}>
            <Link
              href={subItem.href}
              onClick={onItemClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {/* Left active dot */}
              {isActive && (
                <span className="absolute -left-[18px] top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
              )}

              <span className="truncate">{subItem.title}</span>

              {subItem.badge && (
                <span
                  className={cn(
                    "ml-2 shrink-0 rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-none",
                    subItem.badge.variant === "destructive" &&
                      "bg-destructive/15 text-destructive",
                    subItem.badge.variant === "warning" &&
                      "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    (!subItem.badge.variant ||
                      subItem.badge.variant === "secondary") &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {subItem.badge.label}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
