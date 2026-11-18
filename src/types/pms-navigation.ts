import type { LucideIcon } from "lucide-react";
import type { PermissionKey, Department } from "@/lib/permissions/permission-types";

export interface NavBadge {
  label: string | number;
  variant?: "default" | "secondary" | "destructive" | "outline" | "warning";
}

export interface NavSubItem {
  id: string;
  title: string;
  href: string;
  permission?: PermissionKey;
  department?: Department;
  badge?: NavBadge;
  disabled?: boolean;
}

export interface NavItem {
  id: string;
  title: string;
  href?: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  department?: Department;
  badge?: NavBadge;
  disabled?: boolean;
  children?: NavSubItem[];
}

export interface NavGroup {
  id: string;
  heading: string;
  permission?: PermissionKey;
  department?: Department;
  items: NavItem[];
}
