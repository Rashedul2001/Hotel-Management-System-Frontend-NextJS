import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/admin-rooms-api";

export interface ContactMessageItem {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  inquiryType: string;
  status: "Pending" | "Replied" | "Archived";
  replyMessage?: string | null;
  repliedAt?: string | null;
  repliedBy?: string | null;
  createdAt: string;
}

export interface CreateContactPayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType?: string;
}

export async function submitContactMessage(
  payload: CreateContactPayload
): Promise<ContactMessageItem> {
  const res = await apiFetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to send contact inquiry."));
  }

  return json as ContactMessageItem;
}

export async function getContactMessages(
  status?: string,
  search?: string
): Promise<ContactMessageItem[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search && search.trim()) params.append("search", search.trim());

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await apiFetch(`/api/contact${query}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unable to fetch contact inquiries.");
  }

  return res.json();
}

export async function getContactMessageById(
  id: number
): Promise<ContactMessageItem> {
  const res = await apiFetch(`/api/contact/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Inquiry #${id} not found.`);
  }

  return res.json();
}

export async function replyContactMessage(
  id: number,
  replyMessage: string
): Promise<ContactMessageItem> {
  const res = await apiFetch(`/api/contact/${id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ replyMessage }),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to send reply to guest."));
  }

  return json as ContactMessageItem;
}

export async function deleteContactMessage(
  id: number
): Promise<{ id: number; message: string }> {
  const res = await apiFetch(`/api/contact/${id}`, {
    method: "DELETE",
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to delete contact inquiry."));
  }

  return json as { id: number; message: string };
}
