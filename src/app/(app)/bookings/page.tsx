import type { Metadata } from "next";
import MyBookings from "@/components/hotel/my-bookings";
import { ProtectedContent } from "@/providers/protected-content";

export const metadata: Metadata = {
  title: "My Bookings | Velora Hotels",
  description:
    "View and manage your reservations at Velora Hotels.",
};

export default function BookingsPage() {
  return (
    <ProtectedContent>
      <MyBookings />
    </ProtectedContent>
  );
}