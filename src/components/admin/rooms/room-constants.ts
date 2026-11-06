import type { RoomStatus } from "@/types/room";

export const ROOM_CATEGORIES = [
  "Standard",
  "Deluxe",
  "Suite",
  "Penthouse",
  "Family",
  "Executive",
] as const;

export const ROOM_STATUSES: RoomStatus[] = [
  "Available",
  "Occupied",
  "Cleaning",
  "Maintenance",
  "Blocked",
];

export const BED_TYPES = [
  "Single",
  "Twin",
  "Double",
  "Queen",
  "King",
] as const;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | undefined): string {
  if (!value) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function statusClasses(status: string): string {
  switch (status) {
    case "Available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "Occupied":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "Cleaning":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "Maintenance":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
    case "Blocked":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
