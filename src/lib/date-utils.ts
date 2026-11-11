import { format, parse, isValid, startOfDay, isBefore, isSameDay, addDays } from "date-fns";

export function parseDateString(value: string | null | undefined): Date | undefined {
  if (!value || !value.trim()) return undefined;
  let str = value.trim();
  try {
    str = decodeURIComponent(str);
  } catch {
    // ignore decode error and use raw str
  }

  // If already in ISO or date format containing T
  if (str.includes("T")) {
    const d = new Date(str);
    if (isValid(d) && !isNaN(d.getTime())) return startOfDay(d);
  }

  // Try dd/MM/yyyy
  let d = parse(str, "dd/MM/yyyy", new Date());
  if (isValid(d)) return startOfDay(d);

  // Try d/M/yyyy
  d = parse(str, "d/M/yyyy", new Date());
  if (isValid(d)) return startOfDay(d);

  // Try dd-MM-yyyy
  d = parse(str, "dd-MM-yyyy", new Date());
  if (isValid(d)) return startOfDay(d);

  // Try d-M-yyyy
  d = parse(str, "d-M-yyyy", new Date());
  if (isValid(d)) return startOfDay(d);

  // Try yyyy-MM-dd
  d = parse(str, "yyyy-MM-dd", new Date());
  if (isValid(d)) return startOfDay(d);

  // Try yyyy/MM/dd
  d = parse(str, "yyyy/MM/dd", new Date());
  if (isValid(d)) return startOfDay(d);

  // Fallback to new Date(str)
  d = new Date(str);
  if (isValid(d) && !isNaN(d.getTime())) return startOfDay(d);

  return undefined;
}

export function formatDateToDDMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    const parsed = parseDateString(date);
    return parsed ? format(parsed, "dd/MM/yyyy") : "";
  }
  if (isValid(date)) {
    return format(date, "dd/MM/yyyy");
  }
  return "";
}

export function formatDisplayDate(
  date: Date | string | null | undefined,
  pattern: string = "MMM d, yyyy"
): string {
  if (!date) return "";
  const d = date instanceof Date ? date : parseDateString(date);
  if (!d || !isValid(d)) return typeof date === "string" ? date : "";
  return format(d, pattern);
}

export function calculateNights(
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined
): number {
  const start = checkIn instanceof Date ? checkIn : parseDateString(checkIn);
  const end = checkOut instanceof Date ? checkOut : parseDateString(checkOut);
  if (!start || !end) return 1;

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
}

export function validateStayDates(
  checkIn: Date | string | null | undefined,
  checkOut: Date | string | null | undefined
): { isValid: boolean; error?: string } {
  // Check if string arguments were provided but unparseable
  if (typeof checkIn === "string" && checkIn.trim() && !parseDateString(checkIn)) {
    return {
      isValid: false,
      error: "Invalid check-in date format. Expected dd/mm/yyyy.",
    };
  }

  if (typeof checkOut === "string" && checkOut.trim() && !parseDateString(checkOut)) {
    return {
      isValid: false,
      error: "Invalid check-out date format. Expected dd/mm/yyyy.",
    };
  }

  const inDate = checkIn instanceof Date ? checkIn : parseDateString(checkIn);
  const outDate = checkOut instanceof Date ? checkOut : parseDateString(checkOut);
  const today = startOfDay(new Date());

  if (inDate) {
    if (isBefore(inDate, today)) {
      return {
        isValid: false,
        error: "Check-in date cannot be in the past.",
      };
    }
  }

  if (inDate && outDate) {
    if (isBefore(outDate, inDate) || isSameDay(outDate, inDate)) {
      return {
        isValid: false,
        error: "Check-out date must be after check-in date.",
      };
    }
  } else if (outDate) {
    if (isBefore(outDate, today) || isSameDay(outDate, today)) {
      return {
        isValid: false,
        error: "Check-out date must be in the future.",
      };
    }
  }

  return { isValid: true };
}
