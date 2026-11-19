import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/admin-rooms-api";

export interface HeroSettingResponse {
  imageUrl: string;
  publicId: string | null;
  isCustom: boolean;
  updatedAt: string;
  message?: string;
}

export interface HotelInfoResponse {
  hotelName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
}

export interface OfferItem {
  id: number;
  title: string;
  description: string;
  discount: string;
  code?: string | null;
  discountPercentage?: number;
  roomId?: string | null;
  roomName?: string | null;
  category?: string | null;
  imageUrl: string;
  imagePublicId?: string | null;
  isActive: boolean;
  startDate?: string | null;
  validUntil?: string | null;
  createdAt: string;
}

export interface ReviewItem {
  id: number;
  roomId: string;
  roomName?: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  bookingId?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RoomReviewsResponse {
  roomId: string;
  roomName: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewItem[];
}

// ---------------------------------------------------------------------------
// HERO SECTION SETTINGS
// ---------------------------------------------------------------------------

export async function getHeroSetting(): Promise<HeroSettingResponse> {
  const res = await apiFetch("/api/settings/hero", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Unable to fetch hero settings.");
  }
  return res.json();
}

export async function updateHeroImage(file?: File, imageUrl?: string): Promise<HeroSettingResponse> {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (imageUrl) {
    formData.append("imageUrl", imageUrl.trim());
  }

  const res = await apiFetch("/api/settings/hero", {
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
    throw new Error(getErrorMessage(json, "Unable to update hero image."));
  }

  return json as HeroSettingResponse;
}

export async function resetHeroImage(): Promise<HeroSettingResponse> {
  const res = await apiFetch("/api/settings/hero", {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Unable to reset hero image.");
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// HOTEL INFO SETTINGS
// ---------------------------------------------------------------------------

export async function getHotelInfo(): Promise<HotelInfoResponse> {
  const res = await apiFetch("/api/settings/hotel-info", { method: "GET" });
  if (!res.ok) throw new Error("Unable to fetch hotel info.");
  return res.json();
}

export async function updateHotelInfo(data: Partial<HotelInfoResponse>): Promise<void> {
  const res = await apiFetch("/api/settings/hotel-info", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Unable to update hotel info.");
}

// ---------------------------------------------------------------------------
// OFFERS API
// ---------------------------------------------------------------------------

export async function getActiveOffers(): Promise<OfferItem[]> {
  const res = await apiFetch("/api/offers", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unable to fetch offers.");
  return res.json();
}

export async function getOfferById(id: number): Promise<OfferItem> {
  const res = await apiFetch(`/api/offers/${id}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Offer not found or expired.");
  return res.json();
}

export async function getAllOffers(): Promise<OfferItem[]> {
  const res = await apiFetch("/api/offers/all", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unable to fetch all offers.");
  return res.json();
}

export async function createOffer(formData: FormData): Promise<OfferItem> {
  const res = await apiFetch("/api/offers", {
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
    throw new Error(getErrorMessage(json, "Unable to create offer."));
  }
  return json as OfferItem;
}

export async function updateOffer(id: number, formData: FormData): Promise<OfferItem> {
  const res = await apiFetch(`/api/offers/${id}`, {
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
    throw new Error(getErrorMessage(json, "Unable to update offer."));
  }
  return json as OfferItem;
}

export async function toggleOfferStatus(id: number, isActive?: boolean): Promise<{ id: number; isActive: boolean }> {
  const res = await apiFetch(`/api/offers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Unable to change offer status.");
  return res.json();
}

export async function deleteOffer(id: number): Promise<void> {
  const res = await apiFetch(`/api/offers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Unable to delete offer.");
}

// ---------------------------------------------------------------------------
// REVIEWS API
// ---------------------------------------------------------------------------

export async function getRoomReviews(roomId: string): Promise<RoomReviewsResponse> {
  const res = await apiFetch(`/api/reviews/room/${roomId}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unable to fetch room reviews.");
  return res.json();
}

export async function createReview(data: {
  roomId: string;
  bookingId?: string;
  rating: number;
  comment: string;
}): Promise<ReviewItem> {
  const res = await apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(getErrorMessage(json, "Unable to submit review."));
  }
  return json as ReviewItem;
}

export async function getMyReviews(): Promise<ReviewItem[]> {
  const res = await apiFetch("/api/reviews/my-reviews", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Unable to fetch your reviews.");
  return res.json();
}
