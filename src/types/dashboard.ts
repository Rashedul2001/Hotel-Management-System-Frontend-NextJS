export interface UserContext {
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  canViewFinancials: boolean;
}

export interface HotelOverviewKpis {
  // 1. Total Physical Rooms
  totalPhysicalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  blockedRooms: number;
  outOfServiceRooms: number;
  sellableRooms: number;

  // 2. Occupancy Rate
  occupancyRate: number;
  occupancyRateYesterday: number;
  occupancyChangePercentage: number;

  // 3. Today's Arrivals
  todaysArrivalsTotal: number;
  todaysArrivalsCheckedIn: number;
  todaysArrivalsPending: number;

  // 4. Today's Departures
  todaysDeparturesTotal: number;
  todaysDeparturesCheckedOut: number;
  todaysDeparturesPending: number;

  // 5. Active Reservations
  activeReservationsCount: number;
  confirmedReservationsCount: number;
  pendingReservationsCount: number;
  cancelledReservationsCount: number;
  noShowReservationsCount: number;

  // 6. Today's Revenue (null if unauthorized)
  todaysRealizedRevenue: number | null;
  todaysRoomRevenue: number | null;
  todaysServiceRevenue: number | null;
  revenueChangePercentage: number | null;

  // 7. ADR
  averageDailyRate: number | null;

  // 8. RevPAR
  revPar: number | null;

  canViewFinancials: boolean;
}

export interface RoomStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  colorClass: string;
  navigationHref: string;
}

export interface ArrivalItem {
  id: string;
  reservationNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  assignedRoomNumber: number | null;
  roomCategory: string;
  expectedArrivalTime: string | null;
  guestsCount: number;
  checkInStatus: "Pending" | "CheckedIn" | string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  paymentStatus: "Paid" | "Pending" | "Partial" | string;
}

export interface DepartureItem {
  id: string;
  reservationNumber: string;
  guestName: string;
  assignedRoomNumber: number | null;
  roomCategory: string;
  departureTime: string | null;
  folioStatus: "Settled" | "BalanceDue" | "PendingReview" | string;
  checkOutStatus: "Pending" | "Completed" | string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  outstandingBalance: number;
}

export interface UpcomingReservation {
  id: string;
  reservationReference: string;
  guestName: string;
  roomCategory: string;
  assignedRoomNumber: number | null;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  totalPrice: number;
  status: "Confirmed" | "PendingPayment" | string;
}

export interface RevenueTrendPoint {
  periodLabel: string;
  roomRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface FinancialOverview {
  canAccess: boolean;
  todaysRevenue: number;
  monthlyRevenue: number;
  roomRevenue: number;
  serviceRevenue: number;
  totalPaymentsCollected: number;
  outstandingGuestBalances: number;
  refunds: number;
  expenses: number;
  netOperatingProfit: number;
  dailyTrends: RevenueTrendPoint[];
  weeklyTrends: RevenueTrendPoint[];
  monthlyTrends: RevenueTrendPoint[];
}

export interface HousekeepingTaskSummary {
  id: string;
  roomNumber: number;
  roomCategory: string;
  priority: "Urgent" | "High" | "Normal";
  status: "Pending" | "InProgress" | "Inspection" | "Clean";
  assignedAttendant: string;
  dueTime: string;
  isOverdue: boolean;
}

export interface HousekeepingOverview {
  canAccess: boolean;
  roomsRequiringCleaning: number;
  roomsBeingCleaned: number;
  roomsAwaitingInspection: number;
  completedTasksToday: number;
  overdueTasks: number;
  activeTasks: HousekeepingTaskSummary[];
}

export interface MaintenanceIssueSummary {
  id: string;
  title: string;
  location: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "InProgress" | "PendingParts" | "Resolved";
  reportedAt: string;
  assignedTechnician: string;
}

export interface MaintenanceOverview {
  canAccess: boolean;
  openMaintenanceRequests: number;
  pendingWorkOrders: number;
  inProgressWorkOrders: number;
  criticalIssues: number;
  recentlyCompleted: number;
  criticalAndOpenIssues: MaintenanceIssueSummary[];
}

export interface RoomServiceOrderSummary {
  id: string;
  orderNumber: string;
  destination: string;
  itemsSummary: string;
  totalAmount: number;
  status: "Pending" | "InPreparation" | "Delivered";
  paymentStatus: "Paid" | "RoomCharge" | "PendingPayment";
  orderTime: string;
}

export interface RoomServiceOverview {
  canAccess: boolean;
  pendingOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  outstandingServiceRequests: number;
  totalOrdersToday: number;
  totalFnbRevenueToday: number;
  activeOrders: RoomServiceOrderSummary[];
}

export interface InventoryItemAlert {
  id: string;
  itemName: string;
  category: string;
  currentStock: number;
  reorderThreshold: number;
  unitOfMeasure: string;
  stockStatus: "Low" | "Out";
}

export interface InventoryOverview {
  canAccess: boolean;
  lowStockItems: number;
  outOfStockItems: number;
  pendingPurchaseRequests: number;
  pendingGoodsReceiving: number;
  criticalStockItems: InventoryItemAlert[];
}

export interface DepartmentOverviews {
  housekeeping: HousekeepingOverview;
  maintenance: MaintenanceOverview;
  roomService: RoomServiceOverview;
  inventory: InventoryOverview;
}

export interface RecentActivityItem {
  id: string;
  type: "reservation" | "checkin" | "checkout" | "payment" | "room_status" | "housekeeping" | "maintenance" | "order" | string;
  title: string;
  description: string;
  staffOrGuestName: string;
  timestampUtc: string;
  timeAgo: string;
  entityReference?: string;
  navigationHref: string;
}

export interface PendingActionAlert {
  id: string;
  title: string;
  description: string;
  count: number;
  severity: "warning" | "destructive" | "info" | "success";
  department: string;
  actionLabel: string;
  actionHref: string;
}

export interface DashboardOverviewResponse {
  propertyName: string;
  propertyTagline: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  generatedAtUtc: string;
  localHotelTime: string;
  currentDateFormatted: string;
  userContext: UserContext;
  kpis: HotelOverviewKpis;
  roomStatuses: RoomStatusDistribution[];
  todaysArrivals: ArrivalItem[];
  todaysDepartures: DepartureItem[];
  upcomingReservations: UpcomingReservation[];
  financials: FinancialOverview | null;
  departments: DepartmentOverviews;
  recentActivities: RecentActivityItem[];
  pendingActions: PendingActionAlert[];
}
