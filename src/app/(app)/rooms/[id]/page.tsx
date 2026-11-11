import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RoomDetails from "@/components/hotel-room/room-details";
import { apiFetch } from "@/lib/api";
import type { Room } from "@/types/room";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkInDate?: string;
    checkOut?: string;
    checkOutDate?: string;
    guests?: string;
  }>;
};

async function getRoom(id: string): Promise<Room | null> {
  try {
    const res = await apiFetch(`/api/rooms/${id}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as Room;
  } catch (error) {
    console.error("Error fetching room details:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoom(id);

  return {
    title: room ? `${room.name} | Velora Hotels` : "Room Details | Velora Hotels",
    description:
      room?.description ??
      "Explore refined rooms and suites at Velora Hotels.",
  };
}

export default async function RoomDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  return (
    <RoomDetails
      room={room}
      initialCheckIn={query.checkIn ?? query.checkInDate ?? ""}
      initialCheckOut={query.checkOut ?? query.checkOutDate ?? ""}
      initialGuests={Number(query.guests ?? 1)}
    />
  );
}
