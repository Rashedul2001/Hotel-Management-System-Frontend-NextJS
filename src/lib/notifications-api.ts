import { apiFetch } from "@/lib/api";

export interface NotificationItem {
  id: string;
  intId: number;
  title: string;
  message: string;
  type: "contact" | "booking" | "payment" | "warning" | "system";
  link?: string | null;
  read: boolean;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
}

export async function getNotifications(
  role: "staff" | "guest" = "guest",
  filter?: "all" | "unread",
  type?: string
): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  params.append("role", role);
  if (filter && filter !== "all") params.append("filter", filter);
  if (type && type !== "all") params.append("type", type);

  const query = `?${params.toString()}`;
  const res = await apiFetch(`/api/notifications${query}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export async function getUnreadNotificationCount(
  role: "staff" | "guest" = "guest"
): Promise<number> {
  try {
    const res = await apiFetch(`/api/notifications/unread-count?role=${role}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(id: number | string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/notifications/read-all`, {
      method: "PATCH",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteNotification(id: number | string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/notifications/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clearAllNotifications(): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/notifications/clear-all`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}
