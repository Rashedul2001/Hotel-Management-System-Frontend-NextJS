import { apiFetch } from "@/lib/api";
import type { Room, RoomAmenity, RoomStatus } from "@/types/room";

type RoomPayload = {
  roomNumber: string;
  name: string;
  category: string;
  floor: number;
  status: RoomStatus;
  price: number;
  capacity: number;
  bedCount: number;
  bedType: string;
  size: number;
  description: string;
  amenityIds: number[];
};

export type AdminRoomsQuery = {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: RoomStatus;
  category?: string;
};

export type AdminRoomsResponse = {
  totalRooms: number;
  rooms: Room[];
};

export type RoomAmenityPayload = Pick<RoomAmenity, "id" | "name">;

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
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
  const totalRooms = record.totalRooms;

  if (!Array.isArray(rooms) || typeof totalRooms !== "number") {
    throw new Error("The rooms API returned an invalid response.");
  }

  return { rooms: rooms as Room[], totalRooms };
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
    body: JSON.stringify({ name }),
  });

  const payload = await readResponse<unknown>(
    response,
    "Unable to create room amenity.",
  );
  return extractAmenity(payload);
}

function createRoomFormData(payload: RoomPayload, images: File[]) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "amenityIds") {
      (value as number[]).forEach((id) =>
        formData.append("amenityIds", String(id)),
      );
    } else {
      formData.append(key, String(value));
    }
  });

  images.forEach((image) => formData.append("images", image));

  return formData;
}

export async function getAdminRooms(
  query: AdminRoomsQuery,
): Promise<AdminRoomsResponse> {
  const searchParams = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
  });

  if (query.searchTerm) searchParams.set("SearchTerm", query.searchTerm);
  if (query.status) searchParams.set("Status", query.status);
  if (query.category) searchParams.set("Category", query.category);

  const response = await apiFetch(`/api/rooms?${searchParams}`, {
    method: "GET",
  });
  const payload = await readResponse<unknown>(
    response,
    "Unable to load rooms.",
  );

  return extractRooms(payload);
}

export async function createAdminRoom(
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

export async function updateAdminRoom(
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

export async function deleteAdminRoom(id: string): Promise<void> {
  const response = await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
  await readResponse(response, "Unable to delete room.");
}

export async function updateAdminRoomStatus(
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
