import type { NavGroup, NavItem, NavSubItem } from "@/types/pms-navigation";
import type { PermissionContextValue } from "./permission-types";

/**
 * Checks whether a single submenu item is accessible.
 */
export function isSubItemAccessible(
  item: NavSubItem,
  context: PermissionContextValue
): boolean {
  if (item.disabled) return false;
  if (context.isSuperAdmin) return true;

  if (item.department && !context.isInDepartment(item.department)) {
    return false;
  }

  if (item.permission && !context.hasPermission(item.permission)) {
    return false;
  }

  return true;
}

/**
 * Checks whether a navigation item (and its children) is accessible,
 * returning a filtered copy with only accessible children.
 */
export function filterAccessibleNavItem(
  item: NavItem,
  context: PermissionContextValue
): NavItem | null {
  if (item.disabled) return null;

  if (context.isSuperAdmin) {
    return item;
  }

  // Check department restriction
  if (item.department && !context.isInDepartment(item.department)) {
    return null;
  }

  // Check direct permission restriction
  if (item.permission && !context.hasPermission(item.permission)) {
    // If the item itself requires a permission that the user lacks,
    // and it doesn't have accessible children, hide it.
    if (!item.children || item.children.length === 0) {
      return null;
    }
  }

  // Filter children if present
  if (item.children && item.children.length > 0) {
    const accessibleChildren = item.children.filter((child) =>
      isSubItemAccessible(child, context)
    );

    // If item has children defined, but none are accessible:
    if (accessibleChildren.length === 0) {
      // If it doesn't have an independent accessible href, hide it
      if (!item.href || (item.permission && !context.hasPermission(item.permission))) {
        return null;
      }
      return {
        ...item,
        children: undefined,
      };
    }

    return {
      ...item,
      children: accessibleChildren,
    };
  }

  // No children: check permission
  if (item.permission && !context.hasPermission(item.permission)) {
    return null;
  }

  return item;
}

/**
 * Filters the entire navigation hierarchy so that only groups with at least
 * one accessible item are returned.
 */
export function filterAccessibleNavigation(
  groups: NavGroup[],
  context: PermissionContextValue
): NavGroup[] {
  if (context.isSuperAdmin) {
    return groups;
  }

  return groups
    .map((group) => {
      // Check group-level permissions
      if (group.department && !context.isInDepartment(group.department)) {
        return null;
      }
      if (group.permission && !context.hasPermission(group.permission)) {
        return null;
      }

      const accessibleItems = group.items
        .map((item) => filterAccessibleNavItem(item, context))
        .filter((item): item is NavItem => item !== null);

      if (accessibleItems.length === 0) {
        return null;
      }

      return {
        ...group,
        items: accessibleItems,
      };
    })
    .filter((group): group is NavGroup => group !== null);
}
