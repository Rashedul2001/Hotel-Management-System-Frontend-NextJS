"use client";

import { useMemo } from "react";
import { PMS_NAVIGATION } from "@/config/pms-navigation";
import { usePermissions } from "@/lib/permissions/permission-context";
import { filterAccessibleNavigation } from "@/lib/permissions/permission-utils";
import { useSidebar } from "./sidebar-context";
import { SidebarGroup } from "./sidebar-group";
import type { NavGroup } from "@/types/pms-navigation";

export function SidebarNavigation({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const permContext = usePermissions();
  const { searchQuery } = useSidebar();

  // Filter groups by permissions
  const accessibleGroups = useMemo(() => {
    return filterAccessibleNavigation(PMS_NAVIGATION, permContext);
  }, [permContext]);

  // Apply search filtering if active
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accessibleGroups;

    return accessibleGroups
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const itemMatches = item.title.toLowerCase().includes(q);
          const childMatches = item.children?.some((child) =>
            child.title.toLowerCase().includes(q)
          );
          return itemMatches || childMatches;
        });

        if (matchingItems.length === 0) return null;

        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((g): g is NavGroup => g !== null);
  }, [accessibleGroups, searchQuery]);

  return (
    <nav
      role="navigation"
      aria-label="Property Management Navigation"
      className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/30"
    >
      {filteredGroups.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground">
          No accessible menu items found.
        </div>
      ) : (
        filteredGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            onItemClick={onItemClick}
          />
        ))
      )}
    </nav>
  );
}
