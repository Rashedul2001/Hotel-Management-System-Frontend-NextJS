import { apiFetch } from "@/lib/api";
import type { Room, RoomAmenity, RoomStatus } from "@/types/room";

export type RoomPayload = {
  roomNumber: number;
  name: string;
  category: string;
  floor: number;
  status: RoomStatus;
  isFeatured?: boolean;
  price: number;
  capacity: number;
  bedCount: number;
  bedType: string;
  size: number;
  description: string;
  amenityIds: number[];
  existingImageIds?: number[];
};

export type AdminRoomsQuery = {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: RoomStatus;
  category?: string;
};

export type AdminRoomsResponse = {
  totalRooms: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  rooms: Room[];
  summaryCounts?: {
    total: number;
    available: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
    blocked: number;
  };
};

export type RoomAmenityPayload = Pick<RoomAmenity, "id" | "name">;

export function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;

    // 1. Check for ASP.NET Development errors array: [{ Field: "...", Error: "..." }]
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const details = record.errors
        .map((item: unknown) => {
          if (typeof item === "object" && item !== null) {
            const errObj = item as Record<string, unknown>;
            const field = errObj.field ?? errObj.Field ?? "";
            const msg = errObj.error ?? errObj.Error ?? errObj.errorMessage ?? "";
            return field ? `${field}: ${msg}` : String(msg);
          }
          return String(item);
        })
        .filter(Boolean)
        .join("; ");

      if (details) {
        const title = record.message ?? record.title ?? "Validation failed";
        return `${title} — ${details}`;
      }
    }

    // 2. Check for standard ASP.NET ValidationProblemDetails: { errors: { Field: ["error"] } }
    if (
      record.errors &&
      typeof record.errors === "object" &&
      !Array.isArray(record.errors)
    ) {
      const entries = Object.entries(record.errors as Record<string, unknown>);
      if (entries.length > 0) {
        const details = entries
          .map(([field, msgs]) => {
            const msgStr = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
            return `${field}: ${msgStr}`;
          })
          .join("; ");
        const title = record.message ?? record.title ?? "Validation failed";
        return `${title} — ${details}`;
      }
    }

    const message = record.message ?? record.title ?? record.error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  const text = await response.text();
  let payload: unknown;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      typeof payload === "string"
        ? payload
        : getErrorMessage(payload, fallback),
    );
  }

  return payload as T;
}

function extractRooms(payload: unknown): AdminRoomsResponse {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    throw new Error("The rooms API returned an invalid response.");
  }

  const record = payload as Record<string, unknown>;
  const rooms = record.rooms;
  const totalRooms = typeof record.totalRooms === "number" ? record.totalRooms : 0;
  const pageNumber = typeof record.pageNumber === "number" ? record.pageNumber : 1;
  const pageSize = typeof record.pageSize === "number" ? record.pageSize : 10;
  const totalPages =
    typeof record.totalPages === "number"
      ? record.totalPages
      : totalRooms > 0
        ? Math.ceil(totalRooms / pageSize)
        : 1;
  const summaryCounts = record.summaryCounts as AdminRoomsResponse["summaryCounts"];

  if (!Array.isArray(rooms)) {
    throw new Error("The rooms API returned an invalid response.");
  }

  return {
    rooms: rooms as Room[],
    totalRooms,
    pageNumber,
    pageSize,
    totalPages,
    summaryCounts,
  };
}

function extractRoom(payload: unknown): Room {
  const room =
    typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload) &&
      "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (
    typeof room !== "object" ||
    room === null ||
    typeof (room as { id?: unknown }).id !== "string"
  ) {
    throw new Error("The room API returned an invalid room.");
  }

  return room as Room;
}

function extractAmenities(payload: unknown): RoomAmenity[] {
  const amenities =
    Array.isArray(payload)
      ? payload
      : typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        Array.isArray((payload as { data: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : typeof payload === "object" &&
          payload !== null &&
          "amenities" in payload &&
          Array.isArray((payload as { amenities: unknown }).amenities)
          ? (payload as { amenities: unknown[] }).amenities
          : null;

  if (
    !amenities ||
    amenities.some(
      (amenity) =>
        typeof amenity !== "object" ||
        amenity === null ||
        typeof (amenity as { id?: unknown }).id !== "number" ||
        typeof (amenity as { name?: unknown }).name !== "string",
    )
  ) {
    throw new Error("The amenities API returned an invalid response.");
  }

  return amenities as RoomAmenity[];
}

function extractAmenity(payload: unknown): RoomAmenity {
  const amenity =
    typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload) &&
      "data" in payload
      ? (payload as { data: unknown }).data
      : payload;

  if (
    typeof amenity !== "object" ||
    amenity === null ||
    typeof (amenity as { id?: unknown }).id !== "number" ||
    typeof (amenity as { name?: unknown }).name !== "string"
  ) {
    throw new Error("The amenities API returned an invalid amenity.");
  }

  return amenity as RoomAmenity;
}

export async function getRoomAmenities(): Promise<RoomAmenity[]> {
  const response = await apiFetch("/api/rooms/amenities", {
    method: "GET",
  });

  return extractAmenities(
    await readResponse<unknown>(response, "Unable to load room amenities."),
  );
}

export async function createRoomAmenity(name: string): Promise<RoomAmenity> {
  const response = await apiFetch("/api/rooms/amenities", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });

  const payload = await readResponse<unknown>(
    response,
    "Unable to create room amenity.",
  );
  return extractAmenity(payload);
}

function createRoomFormData(payload: RoomPayload, images: File[] = []): FormData {
  const formData = new FormData();

  const roomNumberVal = Math.floor(Number(payload.roomNumber));
  formData.append("roomNumber", String(Number.isFinite(roomNumberVal) ? roomNumberVal : 1));
  formData.append("name", (payload.name || "").trim());
  formData.append("category", (payload.category || "").trim());

  const floorVal = Math.floor(Number(payload.floor));
  formData.append("floor", String(Number.isFinite(floorVal) ? floorVal : 1));

  formData.append("status", payload.status || "Available");
  formData.append("isFeatured", String(Boolean(payload.isFeatured)));

  const priceVal = Math.round(Number(payload.price));
  formData.append("price", String(Number.isFinite(priceVal) && priceVal > 0 ? priceVal : 1000));

  const capacityVal = Math.floor(Number(payload.capacity));
  formData.append("capacity", String(Number.isFinite(capacityVal) && capacityVal >= 1 ? capacityVal : 1));

  const bedCountVal = Math.floor(Number(payload.bedCount));
  formData.append("bedCount", String(Number.isFinite(bedCountVal) && bedCountVal >= 1 ? bedCountVal : 1));

  formData.append("bedType", (payload.bedType || "Queen").trim());

  const sizeVal = Math.floor(Number(payload.size));
  formData.append("size", String(Number.isFinite(sizeVal) && sizeVal >= 1 ? sizeVal : 30));

  formData.append("description", (payload.description || "").trim());

  if (Array.isArray(payload.amenityIds)) {
    payload.amenityIds.forEach((id) => {
      const numId = Number(id);
      if (Number.isFinite(numId)) {
        formData.append("amenityIds", String(numId));
      }
    });
  }

  if (Array.isArray(payload.existingImageIds)) {
    payload.existingImageIds.forEach((id) => {
      const numId = Number(id);
      if (Number.isFinite(numId)) {
        formData.append("existingImageIds", String(numId));
      }
    });
  }

  if (Array.isArray(images)) {
    images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });
  }

  return formData;
}

export async function getRooms(
  query: AdminRoomsQuery = {},
): Promise<AdminRoomsResponse> {
  const searchParams = new URLSearchParams({
    includeAll: "true",
  });

  if (typeof query.pageNumber === "number" && query.pageNumber > 0) {
    searchParams.set("pageNumber", String(query.pageNumber));
  }
  if (typeof query.pageSize === "number" && query.pageSize > 0) {
    searchParams.set("pageSize", String(query.pageSize));
  }
  if (query.searchTerm) searchParams.set("SearchTerm", query.searchTerm);
  if (query.status) searchParams.set("Status", query.status);
  if (query.category) searchParams.set("Category", query.category);

  const response = await apiFetch(`/api/rooms?${searchParams.toString()}`, {
    method: "GET",
  });
  const payload = await readResponse<unknown>(
    response,
    "Unable to load rooms.",
  );

  return extractRooms(payload);
}

export async function createRoom(
  payload: RoomPayload,
  images: File[] = [],
): Promise<Room> {
  const response = await apiFetch("/api/rooms", {
    method: "POST",
    body: createRoomFormData(payload, images),
  });

  return extractRoom(
    await readResponse<unknown>(response, "Unable to create room."),
  );
}

export async function updateRoom(
  id: string,
  payload: RoomPayload,
  images: File[] = [],
): Promise<Room> {
  const response = await apiFetch(`/api/rooms/${id}`, {
    method: "PUT",
    body: createRoomFormData(payload, images),
  });

  return extractRoom(
    await readResponse<unknown>(response, "Unable to update room."),
  );
}

export async function deleteRoom(id: string): Promise<void> {
  const response = await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
  await readResponse(response, "Unable to delete room.");
}

export async function updateRoomStatus(
  id: string,
  status: RoomStatus,
): Promise<Room> {
  const response = await apiFetch(`/api/rooms/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  return extractRoom(
    await readResponse<unknown>(response, "Unable to update room status."),
  );
}

export async function fetchRoomSummaryCounts(): Promise<AdminRoomsResponse["summaryCounts"]> {
  const response = await apiFetch("/api/rooms/summary-counts");
  if (!response.ok) return undefined;
  return response.json();
}

export async function toggleRoomFeatured(
  id: string,
  isFeatured?: boolean,
): Promise<Room> {
  const response = await apiFetch(`/api/rooms/${id}/featured`, {
    method: "PATCH",
    body: JSON.stringify({ isFeatured }),
  });

  return extractRoom(
    await readResponse<unknown>(response, "Unable to update featured status."),
  );
}

export async function updateRoomPrice(
  id: string,
  price: number,
): Promise<Room> {
  const response = await apiFetch(`/api/rooms/${id}/price`, {
    method: "PATCH",
    body: JSON.stringify({ price }),
  });

  return extractRoom(
    await readResponse<unknown>(response, "Unable to update room price."),
  );
}
