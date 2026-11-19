import type { Metadata } from "next";
import CheckoutPage from "@/components/hotel/checkout-page";

export const metadata: Metadata = {
  title: "Checkout | Velora Hotels",
  description:
    "Complete your reservation securely with Velora Hotels.",
};

type Props = {
  searchParams: Promise<{
    room?: string;
    checkIn?: string;
    checkInDate?: string;
    checkOut?: string;
    checkOutDate?: string;
    guests?: string;
    error?: string;
    offerId?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <CheckoutPage
      roomId={params.room ?? ""}
      checkIn={params.checkIn ?? params.checkInDate ?? ""}
      checkOut={params.checkOut ?? params.checkOutDate ?? ""}
      guests={Number(params.guests ?? 1)}
      initialError={params.error ?? ""}
      offerId={params.offerId}
    />
  );
}