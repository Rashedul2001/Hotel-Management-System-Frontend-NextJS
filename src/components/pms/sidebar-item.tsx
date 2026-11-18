"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/types/pms-navigation";
import { useSidebar } from "./sidebar-context";
import { SidebarSubmenu } from "./sidebar-submenu";
import { isRouteActive } from "@/lib/pms-route-utils";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavItem;
  onItemClick?: () => void;
}

export function SidebarItem({ item, onItemClick }: SidebarItemProps) {
  const pathname = usePathname();
  const { isCollapsed, isSubmenuOpen, toggleSubmenu, setIsCollapsed } =
    useSidebar();

  const hasChildren = Boolean(item.children && item.children.length > 0);
  const isOpen = isSubmenuOpen(item.id);

  // Determine if this item or any of its children is currently active
  const isDirectlyActive = isRouteActive(item.href, pathname);

  const hasActiveChild = Boolean(
    item.children?.some((child) => isRouteActive(child.href, pathname))
  );

  const isActive = isDirectlyActive || hasActiveChild;
  const Icon = item.icon;

  // Handle click for items with children vs direct link
  const handleItemClick = (e: React.MouseEvent) => {
    if (isCollapsed) {
      // In collapsed mode, clicking an item expands the sidebar and opens the submenu
      setIsCollapsed(false);
      if (hasChildren && !isOpen) {
        toggleSubmenu(item.id);
      }
      return;
    }

    if (hasChildren) {
      e.preventDefault();
      toggleSubmenu(item.id);
    } else {
      onItemClick?.();
    }
  };

  const itemContent = (
    <div
      className={cn(
        "group relative flex items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150 select-none",
        isCollapsed ? "justify-center px-0 py-2.5" : "justify-between",
        isActive
          ? "bg-primary/10 text-primary font-semibold shadow-xs"
          : "text-foreground/80 hover:bg-accent/70 hover:text-foreground",
        item.disabled && "pointer-events-none opacity-50"
      )}
      title={isCollapsed ? item.title : undefined}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 min-w-0",
          isCollapsed && "justify-center"
        )}
      >
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
            isActive
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>

        {!isCollapsed && (
          <span className="truncate text-xs font-medium tracking-tight">
            {item.title}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center gap-1.5 shrink-0">
          {item.badge && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                item.badge.variant === "destructive" &&
                  "bg-destructive/15 text-destructive",
                item.badge.variant === "warning" &&
                  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                (!item.badge.variant || item.badge.variant === "secondary") &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {item.badge.label}
            </span>
          )}

          {hasChildren && (
            <ChevronDown
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>
      )}

      {/* Floating dot on collapsed item if active */}
      {isCollapsed && isActive && (
        <span className="absolute right-1 top-1.5 size-1.5 rounded-full bg-primary" />
      )}
    </div>
  );

  return (
    <div className="w-full">
      {hasChildren ? (
        <button
          type="button"
          onClick={handleItemClick}
          aria-expanded={isOpen}
          className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          {itemContent}
        </button>
      ) : item.href ? (
        <Link
          href={item.href}
          onClick={onItemClick}
          aria-current={isActive ? "page" : undefined}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        >
          {itemContent}
        </Link>
      ) : (
        itemContent
      )}

      {/* Nested Submenu (rendered in expanded mode) */}
      {!isCollapsed && hasChildren && item.children && (
        <SidebarSubmenu
          items={item.children}
          isOpen={isOpen}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}
