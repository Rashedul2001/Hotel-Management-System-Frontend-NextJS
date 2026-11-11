import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingDetails from "@/components/hotel/booking-details";
import { ProtectedContent } from "@/providers/protected-content";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export const dynamic = "force-dynamic";

type BookingPageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

async function getBooking(bookingId: string) {
  try {
    const cookieStore = await cookies();
    const res = await apiFetch(`/api/bookings/${bookingId}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return {
      id: data.id,
      confirmationNumber: data.confirmationNumber,
      roomName: data.roomName,
      roomCategory: data.roomCategory,
      roomImage:
        data.roomImage ||
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85",
      checkIn: data.checkInDate,
      checkOut: data.checkOutDate,
      guests: data.guestsCount,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      bookingForSomeoneElse: data.isBookingForSomeoneElse,
      total: data.totalPrice,
      paymentStatus: data.paidAt ? "Paid" : "Pending",
      paymentMethod: data.paymentMethod || "SSLCommerz",
      status: data.status,
      specialRequests: data.specialRequests || "",
      roomSize: "45 sq m",
      beds: "King Bed",
      maxGuests: data.guestsCount,
      amenities: [
        "Free High-speed Wi-Fi",
        "Air Conditioning",
        "Ensuite Bathroom",
        "Smart TV",
        "Breakfast Service Available",
      ],
    };
  } catch (error) {
    console.error("Failed to fetch booking details:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

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
  const booking = await getBooking(bookingId);

  return (
    <ProtectedContent>
      <BookingDetails booking={booking} bookingId={bookingId} />
    </ProtectedContent>
  );
}
