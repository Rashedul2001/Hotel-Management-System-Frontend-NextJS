export type PermissionKey =
  // Overview
  | "dashboard.view"
  | "calendar.view"
  | "notifications.view"
  // Front Office - Reservations
  | "reservations.view"
  | "reservations.create"
  | "reservations.update"
  | "reservations.cancel"
  | "reservations.checkin"
  | "reservations.checkout"
  // Front Office - Front Desk
  | "frontdesk.view"
  | "frontdesk.arrivals"
  | "frontdesk.departures"
  | "frontdesk.cashier"
  // Front Office - Guests
  | "guests.view"
  | "guests.create"
  | "guests.update"
  | "guests.feedback"
  // Front Office - Rooms & Rates
  | "rooms.view"
  | "rooms.create"
  | "rooms.update"
  | "rooms.delete"
  | "rooms.assign"
  // Front Office - Billing & Payments
  | "billing.view"
  | "billing.folio"
  | "billing.payment"
  | "billing.refund"
  // Front Office - Night Audit
  | "nightaudit.view"
  | "nightaudit.run"
  // Hotel Operations - Housekeeping
  | "housekeeping.view"
  | "housekeeping.task.create"
  | "housekeeping.task.assign"
  | "housekeeping.task.complete"
  // Hotel Operations - Maintenance
  | "maintenance.view"
  | "maintenance.request.create"
  | "maintenance.workorder.manage"
  // Hotel Operations - Restaurant & Room Service
  | "roomservice.view"
  | "roomservice.order.create"
  | "roomservice.order.update"
  // Hotel Operations - Inventory
  | "inventory.view"
  | "inventory.stock.manage"
  | "inventory.purchase.create"
  // Hotel Operations - Facilities
  | "facilities.view"
  | "facilities.service.request"
  // Business & Finance - Finance & Accounting
  | "finance.view"
  | "finance.transaction.create"
  | "finance.transaction.approve"
  | "finance.expense.manage"
  | "finance.report.view"
  // Business & Finance - Revenue Management
  | "revenue.view"
  | "revenue.analytics"
  // Business & Finance - Reports & Analytics
  | "reports.view"
  | "reports.custom"
  // People Management - Staff & Departments
  | "staff.view"
  | "staff.manage"
  // System Administration - Users, Roles & Permissions
  | "users.view"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "roles.view"
  | "roles.create"
  | "roles.update"
  | "permissions.assign"
  // System Administration - Configuration & Audits
  | "settings.view"
  | "settings.update"
  | "auditlogs.view";

export type Department =
  | "Management"
  | "FrontDesk"
  | "Reservations"
  | "Housekeeping"
  | "Maintenance"
  | "Restaurant"
  | "Inventory"
  | "Finance"
  | "HumanResources"
  | "Administration";

export interface PermissionContextValue {
  permissions: Set<PermissionKey>;
  departments: Set<Department>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  hasPermission: (permission?: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  isInDepartment: (department?: Department) => boolean;
  setMockOverrides?: (overrides: {
    permissions?: PermissionKey[];
    departments?: Department[];
  }) => void;
}
