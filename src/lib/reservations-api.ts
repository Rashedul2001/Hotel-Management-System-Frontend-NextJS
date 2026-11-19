import { apiFetch } from "@/lib/api";

export interface Reservation {
  id: string;
  confirmationNumber: string;
  roomId: string;
  roomName: string;
  roomCategory: string;
  roomNumber?: number | null;
  floor?: number | null;
  roomStatus?: string | null;
  roomPrice?: number | null;
  roomImage?: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show";
  paymentExpiresAt?: string | null;
  isBookingForSomeoneElse: boolean;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string | null;
  arrivalTime?: string | null;
  offerId?: number | null;
  paymentMethod?: string | null;
  paymentStatus?: "Paid" | "Pending" | string;
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffCreateBookingInput {
  roomId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  guestsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  arrivalTime?: string;
  totalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: "Paid" | "Pending";
  status?: "Confirmed" | "CheckedIn";
}

export interface FrontDeskSummary {
  today: string;
  arrivals: {
    total: number;
    checkedIn: number;
    pending: number;
  };
  departures: {
    total: number;
    checkedOut: number;
    pending: number;
  };
  inHouse: number;
  rooms: {
    total: number;
    available: number;
    occupied: number;
    cleaning: number;
    occupancyRate: number;
  };
}

export interface CalendarRoom {
  id: string;
  roomNumber: number;
  name: string;
  category: string;
  floor: number;
  status: string;
  price: number;
  capacity: number;
  bedType: string;
}

export interface CalendarBooking {
  id: string;
  confirmationNumber: string;
  roomId: string;
  roomNumber: number;
  roomName: string;
  roomCategory: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  specialRequests?: string;
}

export interface CalendarData {
  year: number;
  month: number;
  daysInMonth: number;
  rooms: CalendarRoom[];
  bookings: CalendarBooking[];
}

export interface GetReservationsParams {
  search?: string;
  status?: string;
  category?: string;
  checkInDate?: string;
  checkOutDate?: string;
  view?: "all" | "arrivals" | "departures" | "in-house" | "upcoming";
  limit?: number;
}

export async function getReservations(params?: GetReservationsParams): Promise<Reservation[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.category && params.category !== "all") query.append("category", params.category);
  if (params?.checkInDate) query.append("checkInDate", params.checkInDate);
  if (params?.checkOutDate) query.append("checkOutDate", params.checkOutDate);
  if (params?.view && params.view !== "all") query.append("view", params.view);
  if (params?.limit) query.append("limit", params.limit.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch(`/api/bookings${queryString}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load reservations (${res.status})`);
  }

  return res.json();
}

export async function getReservationById(id: string): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Reservation #${id} not found`);
  }

  return res.json();
}

export async function createStaffReservation(data: StaffCreateBookingInput): Promise<Reservation> {
  const res = await apiFetch("/api/bookings/staff-create", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create reservation");
  }

  return res.json();
}

export async function checkInReservation(id: string): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/check-in`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to check in guest");
  }

  return res.json();
}

export async function checkOutReservation(id: string): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/check-out`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to check out guest");
  }

  return res.json();
}

export async function reassignRoom(
  id: string,
  newRoomId: string,
  reason?: string
): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/reassign-room`, {
    method: "POST",
    body: JSON.stringify({ newRoomId, reason }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to reassign room");
  }

  return res.json();
}

export async function updateReservationStatus(
  id: string,
  status: string,
  note?: string
): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update reservation status");
  }

  return res.json();
}

export async function updateReservationDetails(
  id: string,
  data: Partial<StaffCreateBookingInput>
): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/details`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update reservation details");
  }

  return res.json();
}

export async function cancelReservation(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/bookings/${id}/cancel`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to cancel reservation");
  }

  return true;
}

export async function getFrontDeskSummary(): Promise<FrontDeskSummary> {
  const res = await apiFetch("/api/bookings/front-desk-summary", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load front desk summary");
  }

  return res.json();
}

export async function getCalendarTapeChart(
  year?: number,
  month?: number
): Promise<CalendarData> {
  const query = new URLSearchParams();
  if (year) query.append("year", year.toString());
  if (month) query.append("month", month.toString());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await apiFetch(`/api/bookings/calendar${queryString}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load calendar tape chart");
  }

  return res.json();
}

export interface CashierTransaction {
  id: string;
  confirmationNumber: string;
  transactionId: string;
  guestName: string;
  guestPhone: string;
  roomNumber: number;
  roomCategory: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  status: string;
}

export interface CashierSummary {
  totalCollectedToday: number;
  cashTotal: number;
  cardTotal: number;
  otherTotal: number;
  transactionsCount: number;
}

export interface CashierData {
  summary: CashierSummary;
  transactions: CashierTransaction[];
  pendingFolios: Array<{
    id: string;
    confirmationNumber: string;
    guestName: string;
    guestPhone: string;
    roomNumber: number;
    roomCategory: string;
    totalPrice: number;
    checkInDate: string;
    checkOutDate: string;
    status: string;
  }>;
}

export async function settlePayment(
  id: string,
  paymentMethod: string = "Cash",
  amount?: number,
  note?: string
): Promise<Reservation> {
  const res = await apiFetch(`/api/bookings/${id}/settle-payment`, {
    method: "POST",
    body: JSON.stringify({ paymentMethod, amount, note }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to settle payment");
  }

  return res.json();
}

export async function getCashierTransactions(): Promise<CashierData> {
  const res = await apiFetch("/api/bookings/cashier-transactions", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load cashier transactions");
  }

  return res.json();
}
