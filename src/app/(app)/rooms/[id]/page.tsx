import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RoomDetails from "@/components/hotel-room/room-details";
import { ProtectedContent } from "@/providers/protected-content";

const ROOMS = [
  {
    id: "deluxe-king-room",
    name: "Deluxe King Room",
    category: "Deluxe",
    price: 185,
    rating: 4.8,
    reviews: 124,
    maxGuests: 2,
    size: "420 sq ft",
    beds: "1 King Bed",
    description:
      "A refined sanctuary designed for relaxed stays, featuring a plush king bed, elegant furnishings, and thoughtful modern amenities.",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "City View",
      "Breakfast Available",
      "Mini Bar",
      "Smart TV",
      "Rain Shower",
      "24/7 Room Service",
    ],
  },
  {
    id: "premium-suite",
    name: "Premium Suite",
    category: "Suite",
    price: 320,
    rating: 4.9,
    reviews: 96,
    maxGuests: 3,
    size: "680 sq ft",
    beds: "1 King Bed + Sofa",
    description:
      "An expansive suite with a separate living area, premium furnishings, and sweeping views designed for elevated stays.",
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "Living Area",
      "City View",
      "Bathtub",
      "Mini Bar",
      "Smart TV",
      "Breakfast Included",
    ],
  },
  {
    id: "classic-room",
    name: "Classic Room",
    category: "Standard",
    price: 125,
    rating: 4.6,
    reviews: 87,
    maxGuests: 2,
    size: "320 sq ft",
    beds: "1 Queen Bed",
    description:
      "A comfortable and beautifully appointed room offering everything needed for a relaxed city stay.",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "Queen Bed",
      "Smart TV",
      "Work Desk",
      "Mini Fridge",
      "Rain Shower",
    ],
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    category: "Suite",
    price: 275,
    rating: 4.9,
    reviews: 74,
    maxGuests: 3,
    size: "610 sq ft",
    beds: "1 King Bed + Sofa",
    description:
      "A sophisticated suite balancing generous space, elegant design, and premium comfort for business and leisure.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "Living Area",
      "Breakfast Included",
      "City View",
      "Work Desk",
      "Mini Bar",
    ],
  },
  {
    id: "family-residence",
    name: "Family Residence",
    category: "Family",
    price: 290,
    rating: 4.8,
    reviews: 61,
    maxGuests: 5,
    size: "760 sq ft",
    beds: "1 King + 2 Twin Beds",
    description:
      "A spacious residence designed for families, with multiple sleeping areas and room to unwind together.",
    images: [
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "Twin Beds",
      "Living Area",
      "Breakfast Included",
      "Mini Bar",
      "Bathtub",
    ],
  },
  {
    id: "deluxe-twin-room",
    name: "Deluxe Twin Room",
    category: "Deluxe",
    price: 175,
    rating: 4.7,
    reviews: 102,
    maxGuests: 2,
    size: "410 sq ft",
    beds: "2 Twin Beds",
    description:
      "A polished twin room offering flexible sleeping arrangements with modern comforts and generous space.",
    images: [
      "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1594560913095-7a1b2e2e0d0f?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "Twin Beds",
      "City View",
      "Smart TV",
      "Mini Bar",
      "Work Desk",
    ],
  },
  {
    id: "grand-suite",
    name: "Grand Suite",
    category: "Suite",
    price: 450,
    rating: 5,
    reviews: 48,
    maxGuests: 4,
    size: "980 sq ft",
    beds: "1 King Bed + Sofa",
    description:
      "Our signature suite with exceptional space, elegant interiors, and a private living experience.",
    images: [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "Living Area",
      "Dining Area",
      "Bathtub",
      "Breakfast Included",
      "Mini Bar",
      "Premium View",
    ],
  },
  {
    id: "family-deluxe-room",
    name: "Family Deluxe Room",
    category: "Family",
    price: 230,
    rating: 4.7,
    reviews: 53,
    maxGuests: 4,
    size: "560 sq ft",
    beds: "1 King + 2 Twin Beds",
    description:
      "A warm, spacious room created for families who want comfort, convenience, and plenty of room to settle in.",
    images: [
      "https://images.unsplash.com/photo-1578898887932-dce23a5959cc?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=85",
    ],
    amenities: [
      "Free Wi-Fi",
      "King Bed",
      "Twin Beds",
      "Breakfast Included",
      "City View",
      "Mini Bar",
    ],
  },
];

type PageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { roomId } = await params;
  const room = ROOMS.find((item) => item.id === roomId);

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
  const { roomId } = await params;
  const query = await searchParams;

  let room = ROOMS.find((item) => item.id === roomId);

  if (!room) {
    // for now we'll return a template page 
    room = ROOMS[0]; // default to the first room if not found

    // notFound();
  }

  return (
    <ProtectedContent>
      <RoomDetails
        room={room}
        initialCheckIn={query.checkIn ?? ""}
        initialCheckOut={query.checkOut ?? ""}
        initialGuests={Number(query.guests ?? 1)}
      />
    </ProtectedContent>
  );
}