import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/admin-rooms-api";

export interface GalleryImageItem {
  id: number;
  title: string;
  category: string;
  description: string;
  src: string;
  imageUrl: string;
  publicId?: string | null;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CreateGalleryImagePayload {
  file?: File | null;
  imageUrl?: string | null;
  title: string;
  category: string;
  description?: string;
  featured?: boolean;
  displayOrder?: number;
}

export interface UpdateGalleryImagePayload {
  file?: File | null;
  imageUrl?: string | null;
  title?: string;
  category?: string;
  description?: string;
  featured?: boolean;
  displayOrder?: number;
}

export async function getGalleryImages(category?: string): Promise<GalleryImageItem[]> {
  const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
  const res = await apiFetch(`/api/gallery${query}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unable to fetch gallery pictures.");
  }

  return res.json();
}

export async function getGalleryCategories(): Promise<string[]> {
  const res = await apiFetch("/api/gallery/categories", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    return ["All", "Rooms", "Dining", "Wellness", "Exterior", "Experiences"];
  }

  return res.json();
}

export async function createGalleryImage(
  payload: CreateGalleryImagePayload
): Promise<GalleryImageItem> {
  const formData = new FormData();
  if (payload.file) {
    formData.append("file", payload.file);
  }
  if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl.trim());
  }
  formData.append("title", payload.title.trim());
  formData.append("category", payload.category.trim());
  if (payload.description) {
    formData.append("description", payload.description.trim());
  }
  if (payload.featured !== undefined) {
    formData.append("featured", String(payload.featured));
  }
  if (payload.displayOrder !== undefined) {
    formData.append("displayOrder", String(payload.displayOrder));
  }

  const res = await apiFetch("/api/gallery", {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to upload gallery picture."));
  }

  return json as GalleryImageItem;
}

export async function updateGalleryImage(
  id: number,
  payload: UpdateGalleryImagePayload
): Promise<GalleryImageItem> {
  const formData = new FormData();
  if (payload.file) {
    formData.append("file", payload.file);
  }
  if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl.trim());
  }
  if (payload.title) {
    formData.append("title", payload.title.trim());
  }
  if (payload.category) {
    formData.append("category", payload.category.trim());
  }
  if (payload.description !== undefined) {
    formData.append("description", payload.description.trim());
  }
  if (payload.featured !== undefined) {
    formData.append("featured", String(payload.featured));
  }
  if (payload.displayOrder !== undefined) {
    formData.append("displayOrder", String(payload.displayOrder));
  }

  const res = await apiFetch(`/api/gallery/${id}`, {
    method: "PUT",
    body: formData,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Failed to update gallery picture."));
  }

  return json as GalleryImageItem;
}

export async function deleteGalleryImage(
  id: number
): Promise<{ id: number; message: string }> {
  const res = await apiFetch(`/api/gallery/${id}`, {
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
    throw new Error(getErrorMessage(json, "Failed to delete gallery picture."));
  }

  return json as { id: number; message: string };
}
