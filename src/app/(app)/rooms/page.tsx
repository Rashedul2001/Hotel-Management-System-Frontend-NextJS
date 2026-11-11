import type { Metadata } from "next";
import RoomsExplorer from "@/components/hotel-room/rooms-explorer";
import { apiFetch } from "@/lib/api";
import GlobalError from "@/app/error";
import { Room, RoomAmenity } from "@/types/room";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms & Suites | Velora Hotels",
  description:
    "Explore rooms and suites at Velora Hotels. Search, filter, and find the perfect stay based on your guests, budget, room type, and amenities.",
  keywords: [
    "Velora Hotels rooms",
    "hotel rooms",
    "hotel suites",
    "hotel booking",
    "luxury hotel rooms",
    "hotel accommodation",
  ],
  openGraph: {
    title: "Rooms & Suites | Velora Hotels",
    description:
      "Explore and find your perfect room at Velora Hotels.",
    type: "website",
  },
};

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let fetchError: Error | null = null;
  let rooms: Room[] = [];
  let totalRooms: number = 0;
  let amenities: RoomAmenity[] = [];

  try {
    const queryParametersObject = await searchParams;
    const queryParameters = new URLSearchParams();

    // Map checkIn / checkOut aliases
    if (queryParametersObject.checkIn && !queryParametersObject.checkInDate) {
      queryParameters.set("checkInDate", String(queryParametersObject.checkIn));
    }
    if (queryParametersObject.checkOut && !queryParametersObject.checkOutDate) {
      queryParameters.set("checkOutDate", String(queryParametersObject.checkOut));
    }

    Object.entries(queryParametersObject).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParameters.append(key, String(item)));
      } else if (typeof value === "string" && key === "amenityIds" && value.includes(",")) {
        value.split(",").forEach((item) => queryParameters.append(key, item));
      } else if (value !== undefined && value !== null && value !== "") {
        queryParameters.set(key, String(value));
      }
    });

    const [roomsRes, amenitiesRes] = await Promise.all([
      apiFetch(`/api/rooms?${queryParameters.toString()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      apiFetch("/api/rooms/amenities", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => null),
    ]);

    if (amenitiesRes && amenitiesRes.ok) {
      amenities = (await amenitiesRes.json()) || [];
    }

    const data = await roomsRes.json();

    if (!roomsRes.ok) {
      console.warn(`Failed to fetch rooms: ${roomsRes.status} ${roomsRes.statusText}`, data);
      if (roomsRes.status === 400) {
        // Fallback: If 400 error due to bad query parameters, fetch default rooms
        const fallbackRes = await apiFetch("/api/rooms?pageSize=10&pageNumber=1", {
          method: "GET",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          rooms = fallbackData.rooms || [];
          totalRooms = fallbackData.totalRooms || 0;
          fetchError = null;
        } else {
          fetchError = new Error(`Failed to fetch rooms: ${roomsRes.status}`);
        }
      } else {
        fetchError = new Error(
          `Failed to fetch rooms: ${roomsRes.status} ${roomsRes.statusText}`
        );
      }
    } else {
      rooms = data.rooms || [];
      totalRooms = data.totalRooms || 0;
    }
  } catch (e) {
    console.error("Error occurred while fetching rooms:", e);
    fetchError = e instanceof Error ? e : new Error("Error occurred while fetching rooms.");
  }

  if (fetchError) {
    return <GlobalError />;
  }

  return <RoomsExplorer rooms={rooms} totalRooms={totalRooms} initialAmenities={amenities} />;
}
