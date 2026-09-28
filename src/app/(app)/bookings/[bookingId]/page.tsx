import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingDetails from "@/components/hotel/booking-details";
import { ProtectedContent } from "@/providers/protected-content";

const mockBookings = [
  {
    id: "booking-001",
    confirmationNumber: "VEL-8K4P29",
    roomName: "Premium Suite",
    roomCategory: "Suite",
    roomImage:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=85",
    checkIn: "2026-10-10",
    checkOut: "2026-10-13",
    guests: 2,
    guestName: "John Smith",
    guestEmail: "john@example.com",
    guestPhone: "+880 1712-345678",
    bookingForSomeoneElse: false,
    total: 1056,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    status: "confirmed",
    specialRequests: "Late check-in requested.",
    roomSize: "680 sq ft",
    beds: "1 King Bed + Sofa",
    maxGuests: 3,
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
    id: "booking-002",
    confirmationNumber: "VEL-2M7Q51",
    roomName: "Deluxe King Room",
    roomCategory: "Deluxe",
    roomImage:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=85",
    checkIn: "2026-11-04",
    checkOut: "2026-11-07",
    guests: 1,
    guestName: "Sarah Smith",
    guestEmail: "sarah@example.com",
    guestPhone: "+880 1812-345678",
    bookingForSomeoneElse: true,
    total: 610.5,
    paymentStatus: "Pay at hotel",
    paymentMethod: "Pay at hotel",
    status: "confirmed",
    specialRequests: "",
    roomSize: "420 sq ft",
    beds: "1 King Bed",
    maxGuests: 2,
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
    id: "booking-003",
    confirmationNumber: "VEL-5N9R12",
    roomName: "Grand Suite",
    roomCategory: "Suite",
    roomImage:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85",
    checkIn: "2026-07-15",
    checkOut: "2026-07-18",
    guests: 2,
    guestName: "John Smith",
    guestEmail: "john@example.com",
    guestPhone: "+880 1712-345678",
    bookingForSomeoneElse: false,
    total: 1485,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    status: "completed",
    specialRequests: "",
    roomSize: "980 sq ft",
    beds: "1 King Bed + Sofa",
    maxGuests: 4,
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
    id: "booking-004",
    confirmationNumber: "VEL-3C6T88",
    roomName: "Classic Room",
    roomCategory: "Standard",
    roomImage:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1600&q=85",
    checkIn: "2026-06-02",
    checkOut: "2026-06-04",
    guests: 1,
    guestName: "John Smith",
    guestEmail: "john@example.com",
    guestPhone: "+880 1712-345678",
    bookingForSomeoneElse: false,
    total: 275,
    paymentStatus: "Refunded",
    paymentMethod: "Card",
    status: "cancelled",
    specialRequests: "",
    roomSize: "320 sq ft",
    beds: "1 Queen Bed",
    maxGuests: 2,
    amenities: [
      "Free Wi-Fi",
      "Queen Bed",
      "Smart TV",
      "Work Desk",
      "Mini Fridge",
      "Rain Shower",
    ],
  },
];

type BookingPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { bookingId } = await params;

  const booking = mockBookings.find((item) => item.id === bookingId);

  return {
    title: booking
      ? `${booking.roomName} | ${booking.confirmationNumber} | Velora Hotels`
      : "Booking Details | Velora Hotels",
    description: "View your reservation details at Velora Hotels.",
  };
}

export default async function BookingPage({
  params,
}: BookingPageProps) {
  const { bookingId } = await params;

  const booking = mockBookings.find((item) => item.id === bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <ProtectedContent>
      <BookingDetails booking={booking} />
    </ProtectedContent>
  );
}