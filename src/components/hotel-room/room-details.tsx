"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coffee,
  Expand,
  Home,
  MapPin,
  Share2,
  Star,
  Users,
  Wifi,
  X,
} from "lucide-react";

type Room = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  maxGuests: number;
  size: string;
  beds: string;
  description: string;
  images: string[];
  amenities: string[];
};

type Props = {
  room: Room;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
};

export default function RoomDetails({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(
    Math.min(Math.max(initialGuests || 1, 1), room.maxGuests)
  );

  const nextImage = () => {
    setActiveImage((current) => (current + 1) % room.images.length);
  };

  const previousImage = () => {
    setActiveImage(
      (current) => (current - 1 + room.images.length) % room.images.length
    );
  };

  const handleBook = () => {
    const params = new URLSearchParams();

    params.set("room", room.id);

    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);

    params.set("guests", String(guests));

    router.push(`/checkout?${params.toString()}`);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: `${room.name} | Velora Hotels`,
        text: `Take a look at ${room.name} at Velora Hotels.`,
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  return (
    <main className="bg-background min-h-screen">

      {/* Gallery */}
      <section className="py-6 sm:py-8 hotel-container">
        <div className="gap-3 grid lg:grid-cols-[2fr_1fr]">

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative rounded-2xl aspect-16/10 overflow-hidden text-left"
          >
            <Image
              src={room.images[activeImage]}
              alt={room.name}
              fill
              priority
              className="object-cover group-hover:scale-105 transition duration-700"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />

            <span className="inline-flex top-4 right-4 absolute items-center gap-2 bg-black/45 backdrop-blur-md px-3 py-2 rounded-full font-medium text-white text-xs">
              <Expand className="size-3.5" />
              View gallery
            </span>
          </button>

          <div className="hidden gap-3 lg:grid grid-cols-2">
            {room.images.slice(1, 5).map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => {
                  setActiveImage(index + 1);
                  setLightbox(true);
                }}
                className="group relative rounded-2xl overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${room.name} ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-16 sm:pb-24 hotel-container">
        <div className="lg:items-start gap-10 grid lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-secondary px-3 py-1 rounded-full font-semibold text-secondary-foreground text-xs uppercase tracking-wider">
                {room.category}
              </span>

              <div className="flex items-center gap-1 text-sm">
                <Star className="fill-current size-4" />
                <strong>{room.rating}</strong>
                <span className="text-muted-foreground">
                  ({room.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="font-semibold text-4xl sm:text-5xl tracking-tight hotel-display">
                  {room.name}
                </h1>

                <div className="flex flex-wrap gap-5 mt-4 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Home className="size-4" />
                    {room.size}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <BedDouble className="size-4" />
                    {room.beds}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4" />
                    Up to {room.maxGuests} guests
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex justify-center items-center hover:bg-secondary border border-border rounded-full size-10 transition shrink-0"
                aria-label="Share room"
              >
                <Share2 className="size-4" />
              </button>
            </div>

            <div className="my-10 bg-border h-px" />

            <div>
              <h2 className="font-semibold text-xl">About this room</h2>
              <p className="mt-4 max-w-3xl text-muted-foreground leading-7">
                {room.description}
              </p>
            </div>

            <div className="my-10 bg-border h-px" />

            <div>
              <h2 className="font-semibold text-xl">Room amenities</h2>

              <div className="gap-4 grid sm:grid-cols-2 mt-6">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-muted-foreground text-sm"
                  >
                    <span className="flex justify-center items-center bg-secondary rounded-full size-8">
                      <Check className="size-4 text-primary" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="my-10 bg-border h-px" />

            <div>
              <h2 className="font-semibold text-xl">Your stay includes</h2>

              <div className="gap-6 grid sm:grid-cols-3 mt-6">
                <div>
                  <Wifi className="size-5" />
                  <p className="mt-3 font-medium">High-speed Wi-Fi</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Complimentary throughout the hotel.
                  </p>
                </div>

                <div>
                  <Coffee className="size-5" />
                  <p className="mt-3 font-medium">Dining options</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Thoughtful dining experiences nearby.
                  </p>
                </div>

                <div>
                  <Clock3 className="size-5" />
                  <p className="mt-3 font-medium">24/7 support</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Our team is available whenever you need us.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking card */}
          <aside className="lg:top-24 lg:sticky">
            <div className="bg-card shadow-sm p-5 sm:p-6 border border-border rounded-3xl">
              <div className="flex justify-between items-end gap-4">
                <div>
                  <span className="font-semibold text-3xl">
                    ${room.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    / night
                  </span>
                </div>

                <span className="text-muted-foreground text-sm">
                  {room.maxGuests} max guests
                </span>
              </div>

              <div className="gap-3 grid mt-6">
                <label className="font-medium text-sm">
                  Check-in
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className="bg-background mt-2 px-3 border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring w-full h-11 text-sm transition"
                  />
                </label>

                <label className="font-medium text-sm">
                  Check-out
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="bg-background mt-2 px-3 border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring w-full h-11 text-sm transition"
                  />
                </label>

                <label className="font-medium text-sm">
                  Guests
                  <select
                    value={guests}
                    onChange={(event) =>
                      setGuests(Number(event.target.value))
                    }
                    className="bg-background mt-2 px-3 border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring w-full h-11 text-sm"
                  >
                    {Array.from(
                      { length: room.maxGuests },
                      (_, index) => index + 1
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={handleBook}
                className="flex justify-center items-center gap-2 bg-primary hover:opacity-90 mt-5 px-5 rounded-xl w-full h-12 font-semibold text-primary-foreground transition"
              >
                Continue to checkout
                <ArrowRight className="size-4" />
              </button>

              <p className="mt-4 text-muted-foreground text-xs text-center leading-5">
                You will review your reservation before confirming.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-secondary/60 mt-4 p-4 rounded-2xl text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Velora Hotels</p>
                <p className="mt-1 text-muted-foreground">
                  Premium hospitality in the heart of the city.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="top-5 right-5 z-10 absolute flex justify-center items-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full size-11 text-white"
            aria-label="Close gallery"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={previousImage}
            className="top-1/2 left-4 absolute flex justify-center items-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full size-11 text-white -translate-y-1/2"
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>

          <div className="relative w-full max-w-6xl h-[80vh]">
            <Image
              src={room.images[activeImage]}
              alt={room.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            type="button"
            onClick={nextImage}
            className="top-1/2 right-4 absolute flex justify-center items-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full size-11 text-white -translate-y-1/2"
            aria-label="Next image"
          >
            <ChevronRight />
          </button>

          <div className="bottom-5 left-1/2 absolute bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm -translate-x-1/2">
            {activeImage + 1} / {room.images.length}
          </div>
        </div>
      )}
    </main>
  );
}