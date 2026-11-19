import { apiFetch } from "@/lib/api";
import type { DashboardOverviewResponse } from "@/types/dashboard";
import { FALLBACK_DASHBOARD_DATA } from "./mock-department-data";

/**
 * Currency formatter for Hotel Velora (Bangladeshi Taka - BDT)
 */
export function formatBDT(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "—";
  }
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

/**
 * Percentage formatter
 */
export function formatPercentage(value: number | null | undefined, includeSign = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.0%";
  }
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  if (includeSign && value > 0) return `+${formatted}`;
  if (includeSign && value < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Fetch full PMS dashboard overview from backend, with graceful resilient fallback
 */
export async function getDashboardOverview(): Promise<{
  data: DashboardOverviewResponse;
  isLive: boolean;
}> {
  try {
    const response = await apiFetch("/api/dashboard/overview", {
      method: "GET",
      cache: "no-store",
    });

    if (response.ok) {
      const data: DashboardOverviewResponse = await response.json();
      return { data, isLive: true };
    }

    console.warn(`Dashboard API returned status ${response.status}. Using fallback hotel dataset.`);
    return { data: FALLBACK_DASHBOARD_DATA, isLive: false };
  } catch (err) {
    console.warn("Could not reach backend dashboard overview API. Utilizing local hotel dataset fallback.", err);
    return { data: FALLBACK_DASHBOARD_DATA, isLive: false };
  }
}
