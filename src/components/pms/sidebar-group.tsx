"use client";

import type { NavGroup } from "@/types/pms-navigation";
import { useSidebar } from "./sidebar-context";
import { SidebarItem } from "./sidebar-item";
import { cn } from "@/lib/utils";

interface SidebarGroupProps {
  group: NavGroup;
  onItemClick?: () => void;
}

export function SidebarGroup({ group, onItemClick }: SidebarGroupProps) {
  const { isCollapsed } = useSidebar();

  if (!group.items || group.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 py-1.5">
      {/* Group Heading */}
      {isCollapsed ? (
        <div className="my-2.5 mx-auto h-px w-8 bg-border/60" />
      ) : (
        <div className="px-3 pb-1 pt-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {group.heading}
          </h3>
        </div>
      )}

      {/* Items List */}
      <div className={cn("space-y-0.5", isCollapsed ? "px-1.5" : "px-2")}>
        {group.items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}
