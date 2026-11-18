"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthContext";
import { ROLES } from "@/lib/roles";
import type {
  Department,
  PermissionContextValue,
  PermissionKey,
} from "./permission-types";

// Default permissions granted to standard Admin role
const DEFAULT_ADMIN_PERMISSIONS: PermissionKey[] = [
  "dashboard.view",
  "calendar.view",
  "notifications.view",
  "reservations.view",
  "reservations.create",
  "reservations.update",
  "reservations.cancel",
  "reservations.checkin",
  "reservations.checkout",
  "frontdesk.view",
  "frontdesk.arrivals",
  "frontdesk.departures",
  "frontdesk.cashier",
  "guests.view",
  "guests.create",
  "guests.update",
  "guests.feedback",
  "rooms.view",
  "rooms.create",
  "rooms.update",
  "rooms.delete",
  "rooms.assign",
  "billing.view",
  "billing.folio",
  "billing.payment",
  "billing.refund",
  "nightaudit.view",
  "nightaudit.run",
  "housekeeping.view",
  "housekeeping.task.create",
  "housekeeping.task.assign",
  "housekeeping.task.complete",
  "maintenance.view",
  "maintenance.request.create",
  "maintenance.workorder.manage",
  "roomservice.view",
  "roomservice.order.create",
  "roomservice.order.update",
  "inventory.view",
  "inventory.stock.manage",
  "inventory.purchase.create",
  "facilities.view",
  "facilities.service.request",
  "finance.view",
  "finance.transaction.create",
  "finance.transaction.approve",
  "finance.expense.manage",
  "finance.report.view",
  "revenue.view",
  "revenue.analytics",
  "reports.view",
  "reports.custom",
  "staff.view",
  "staff.manage",
  "users.view",
  "roles.view",
  "settings.view",
  "settings.update",
  "auditlogs.view",
];

// Default permissions for standard Staff role
const DEFAULT_STAFF_PERMISSIONS: PermissionKey[] = [
  "dashboard.view",
  "calendar.view",
  "notifications.view",
  "reservations.view",
  "reservations.create",
  "reservations.checkin",
  "reservations.checkout",
  "frontdesk.view",
  "frontdesk.arrivals",
  "frontdesk.departures",
  "guests.view",
  "rooms.view",
  "housekeeping.view",
  "housekeeping.task.complete",
  "maintenance.view",
  "maintenance.request.create",
  "roomservice.view",
  "facilities.view",
];

const PermissionContext = createContext<PermissionContextValue | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // Support local development override without mutating production credentials
  const [mockOverrides, setMockOverrides] = useState<{
    permissions?: PermissionKey[];
    departments?: Department[];
  }>({});

  const isSuperAdmin = useMemo(() => {
    return user?.roles.includes(ROLES.SUPER_ADMIN) ?? false;
  }, [user]);

  const isAdmin = useMemo(() => {
    return user?.roles.includes(ROLES.ADMIN) ?? false;
  }, [user]);

  const isStaff = useMemo(() => {
    return (
      (user?.roles.includes(ROLES.STAFF) || user?.roles.includes(ROLES.USER)) ??
      false
    );
  }, [user]);

  // Derive permissions set
  const permissions = useMemo(() => {
    if (mockOverrides.permissions) {
      return new Set(mockOverrides.permissions);
    }

    // Check if user object has permissions payload (future backend integration)
    const dynamicPermissions = (
      user as unknown as { permissions?: PermissionKey[] }
    )?.permissions;
    if (Array.isArray(dynamicPermissions) && dynamicPermissions.length > 0) {
      return new Set(dynamicPermissions);
    }

    if (isSuperAdmin) {
      // SuperAdmin has all permissions conceptually
      return new Set<PermissionKey>(DEFAULT_ADMIN_PERMISSIONS);
    }

    if (isAdmin) {
      return new Set<PermissionKey>(DEFAULT_ADMIN_PERMISSIONS);
    }

    if (isStaff) {
      return new Set<PermissionKey>(DEFAULT_STAFF_PERMISSIONS);
    }

    return new Set<PermissionKey>();
  }, [user, isSuperAdmin, isAdmin, isStaff, mockOverrides.permissions]);

  // Derive departments set
  const departments = useMemo(() => {
    if (mockOverrides.departments) {
      return new Set(mockOverrides.departments);
    }

    // Check if user object has departments payload (future backend integration)
    const dynamicDepartments = (
      user as unknown as { departments?: Department[] }
    )?.departments;
    if (Array.isArray(dynamicDepartments) && dynamicDepartments.length > 0) {
      return new Set(dynamicDepartments);
    }

    if (isSuperAdmin || isAdmin) {
      return new Set<Department>([
        "Management",
        "FrontDesk",
        "Reservations",
        "Housekeeping",
        "Maintenance",
        "Restaurant",
        "Inventory",
        "Finance",
        "HumanResources",
        "Administration",
      ]);
    }

    if (isStaff) {
      return new Set<Department>(["FrontDesk", "Housekeeping", "Maintenance"]);
    }

    return new Set<Department>();
  }, [user, isSuperAdmin, isAdmin, isStaff, mockOverrides.departments]);

  const hasPermission = (permission?: PermissionKey): boolean => {
    if (!permission) return true;
    if (isSuperAdmin) return true;
    return permissions.has(permission);
  };

  const hasAnyPermission = (required: PermissionKey[]): boolean => {
    if (required.length === 0) return true;
    if (isSuperAdmin) return true;
    return required.some((perm) => permissions.has(perm));
  };

  const hasAllPermissions = (required: PermissionKey[]): boolean => {
    if (required.length === 0) return true;
    if (isSuperAdmin) return true;
    return required.every((perm) => permissions.has(perm));
  };

  const isInDepartment = (dept?: Department): boolean => {
    if (!dept) return true;
    if (isSuperAdmin) return true;
    return departments.has(dept);
  };

  const value: PermissionContextValue = {
    permissions,
    departments,
    isSuperAdmin,
    isAdmin,
    isStaff,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isInDepartment,
    setMockOverrides,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
