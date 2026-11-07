import type { Metadata } from "next";
import RoomsExplorer from "@/components/hotel-room/rooms-explorer";
import { apiFetch } from "@/lib/api";
import GlobalError from "@/app/error";
import { Room } from "@/types/room";

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

  try {
    const queryParametersObject = await searchParams;
    const queryParameters = new URLSearchParams();

    Object.entries(queryParametersObject).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParameters.append(key, String(item)));
      } else if (typeof value === "string" && key === "amenityIds" && value.includes(",")) {
        value.split(",").forEach((item) => queryParameters.append(key, item));
      } else if (value !== undefined && value !== null && value !== "") {
        queryParameters.set(key, String(value));
      }
    });

    const res = await apiFetch(`/api/rooms?${queryParameters.toString()}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    if (!res.ok) {
      fetchError = new Error(
        `Failed to fetch rooms: ${res.status} ${res.statusText}`
      );
    } else {
      rooms = data.rooms || [];
      totalRooms = data.totalRooms || 0;
    }
  }
  catch (e) {
    console.log(e);
    fetchError = e instanceof Error ? e : new Error("Error occurred while fetching rooms.");
  }

  if (fetchError)
    return <GlobalError />;

  return <RoomsExplorer rooms={rooms} totalRooms={totalRooms} />;
}