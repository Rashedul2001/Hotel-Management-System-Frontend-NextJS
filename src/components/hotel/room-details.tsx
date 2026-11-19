"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { errorToast, successToast } from "@/components/ui/toast";
import { useState, useMemo, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { getOfferById, getActiveOffers, type OfferItem } from "@/lib/settings-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDateToDDMMYYYY,
  parseDateString,
  validateStayDates,
} from "@/lib/date-utils";
import { startOfDay, isBefore, isSameDay, addDays } from "date-fns";
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
import { RoomReviewsModal } from "@/components/hotel/room-reviews-modal";
import type { Room } from "@/types/room";
import { formatCurrency } from "@/lib/utils";

type Props = {
  room: Room;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85";

export default function RoomDetails({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerIdParam = searchParams.get("offerId");
  const [appliedOffer, setAppliedOffer] = useState<OfferItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function verifyOffer() {
      if (offerIdParam) {
        try {
          const offer = await getOfferById(Number(offerIdParam));
          const applies =
            offer.isActive &&
            ((offer.roomId && offer.roomId === room.id) ||
              (offer.category &&
                offer.category.toLowerCase() === room.category.toLowerCase()));
          if (applies && isMounted) {
            setAppliedOffer(offer);
            return;
          }
        } catch {
          // Fallback to active offers
        }
      }

      getActiveOffers()
        .then((offers) => {
          if (!isMounted) return;
          const matching = offers.find(
            (o) =>
              o.isActive &&
              ((o.roomId && o.roomId === room.id) ||
                (o.category &&
                  o.category.toLowerCase() === room.category.toLowerCase()))
          );
          if (matching) {
            setAppliedOffer(matching);
          }
        })
        .catch(() => {});
    }

    verifyOffer();
    return () => {
      isMounted = false;
    };
  }, [offerIdParam, room.id, room.category]);

  const effectiveNightlyRate = useMemo(() => {
    if (!appliedOffer || !appliedOffer.discountPercentage) return room.price;
    const discount = Math.round((room.price * appliedOffer.discountPercentage) / 100);
    return Math.max(0, room.price - discount);
  }, [room.price, appliedOffer]);

  const imageUrls = useMemo(() => {
    if (room.images && room.images.length > 0) {
      return room.images.map((img) => img.imageUrl);
    }
    return [DEFAULT_IMAGE];
  }, [room.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(() =>
    parseDateString(initialCheckIn)
  );
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(() =>
    parseDateString(initialCheckOut)
  );
  const maxCapacity = Math.max(1, room.capacity || 1);
  const [guests, setGuests] = useState(
    Math.min(Math.max(initialGuests || 1, 1), maxCapacity)
  );

  const isBookable =
    room.status !== "Maintenance" &&
    room.status !== "Blocked";

  const handleCheckInChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-in date cannot be in the past.");
        return;
      }
      if (checkOutDate && (isBefore(checkOutDate, date) || isSameDay(checkOutDate, date))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        setCheckOutDate(addDays(date, 1));
      } else if (!checkOutDate) {
        setCheckOutDate(addDays(date, 1));
      }
    }
    setCheckInDate(date);
  };

  const handleCheckOutChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-out date cannot be in the past.");
        return;
      }
      if (checkInDate && (isBefore(date, checkInDate) || isSameDay(date, checkInDate))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        return;
      }
    }
    setCheckOutDate(date);
  };

  const nextImage = () => {
    setActiveImage((current) => (current + 1) % imageUrls.length);
  };

  const previousImage = () => {
    setActiveImage(
      (current) => (current - 1 + imageUrls.length) % imageUrls.length
    );
  };

  const handleBook = () => {
    if (!isBookable) {
      errorToast("Unavailable", "This room is currently out of service or unavailable for booking.");
      return;
    }

    const validation = validateStayDates(checkInDate, checkOutDate);
    if (!validation.isValid) {
      errorToast("Validation Error", validation.error || "Please select valid check-in and check-out dates.");
      return;
    }

    const params = new URLSearchParams();

    params.set("room", room.id);

    if (checkInDate) params.set("checkIn", formatDateToDDMMYYYY(checkInDate));
    if (checkOutDate) params.set("checkOut", formatDateToDDMMYYYY(checkOutDate));

    params.set("guests", String(guests));

    if (appliedOffer) {
      params.set("offerId", String(appliedOffer.id));
    }

    router.push(`/checkout?${params.toString()}`);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${room.name} | Velora Hotels`,
          text: `Take a look at ${room.name} at Velora Hotels.`,
          url,
        });
        successToast("Room Shared", "Room shared successfully!");
        return;
      }

      await navigator.clipboard.writeText(url);
      successToast("Copied", "Room link copied to clipboard!");
    } catch {
      errorToast("Share Error", "Could not copy or share link.");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Gallery */}
      <section className="hotel-container py-6 sm:py-8">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          {/* Hero Image */}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative aspect-16/10 overflow-hidden rounded-2xl text-left"
          >
            <Image
              src={imageUrls[activeImage] || DEFAULT_IMAGE}
              alt={room.name}
              fill
              priority
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />

            <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
              <Expand className="size-3.5" />
              View gallery ({imageUrls.length})
            </span>
          </button>

          {/* Thumbnails grid */}
          <div className="hidden grid-cols-2 gap-3 lg:grid">
            {imageUrls.slice(1, 5).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setActiveImage(index + 1);
                  setLightbox(true);
                }}
                className="group relative min-h-[140px] overflow-hidden rounded-2xl"
              >
                <Image
                  src={image}
                  alt={`${room.name} photo ${index + 2}`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="hotel-container pb-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                {room.category}
              </span>

              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <strong>{room.averageRating ? room.averageRating.toFixed(1) : "5.0"}</strong>
                  <span className="text-muted-foreground">
                    ({room.totalReviews || 0} reviews)
                  </span>
                </div>

                <span className="text-border">•</span>

                <button
                  type="button"
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-2 transition cursor-pointer"
                >
                  See reviews
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="hotel-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  {room.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Home className="size-4 text-primary" />
                    {room.size} sq m
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <BedDouble className="size-4 text-primary" />
                    {room.bedCount} {room.bedType} Bed{room.bedCount > 1 ? "s" : ""}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Up to {room.capacity} guests
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition hover:bg-secondary"
                aria-label="Share room"
              >
                <Share2 className="size-4" />
              </button>
            </div>

            <div className="my-10 h-px bg-border" />

            <div>
              <h2 className="text-xl font-semibold">About this room</h2>
              <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                {room.description ||
                  "Experience modern hospitality, elegant interiors, and supreme comfort in our carefully crafted sanctuary."}
              </p>
            </div>

            <div className="my-10 h-px bg-border" />

            <div>
              <h2 className="text-xl font-semibold">Room amenities</h2>

              {room.amenities && room.amenities.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {room.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
                        <Check className="size-4 text-primary" />
                      </span>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Standard hotel amenities included with this room.
                </p>
              )}
            </div>

            <div className="my-10 h-px bg-border" />

            <div>
              <h2 className="text-xl font-semibold">Your stay includes</h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <div>
                  <Wifi className="size-5 text-primary" />
                  <p className="mt-3 font-medium">High-speed Wi-Fi</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complimentary high-speed fiber throughout the hotel.
                  </p>
                </div>

                <div>
                  <Coffee className="size-5 text-primary" />
                  <p className="mt-3 font-medium">Dining & Room Service</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thoughtful dining experiences available around the clock.
                  </p>
                </div>

                <div>
                  <Clock3 className="size-5 text-primary" />
                  <p className="mt-3 font-medium">24/7 Concierge</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our guest relations team is at your service anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {appliedOffer && (
                <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    Special Offer Applied: {appliedOffer.title}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {appliedOffer.discount} automatically applied to your booking rate.
                  </p>
                </div>
              )}

              <div className="flex items-end justify-between gap-4">
                <div>
                  {appliedOffer ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(room.price)}
                        </span>
                        <span className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(effectiveNightlyRate)}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {appliedOffer.discount}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">per night with offer</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-semibold text-foreground">
                        {formatCurrency(room.price)}
                      </span>
                      <span className="text-sm text-muted-foreground"> / night</span>
                    </div>
                  )}
                </div>

                <span className="text-sm text-muted-foreground">
                  {room.capacity} max guests
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Check-in</label>
                  <DatePicker
                    date={checkInDate}
                    onDateChange={handleCheckInChange}
                    minDate={new Date()}
                    placeholder="dd/mm/yyyy"
                    buttonClassName="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Check-out</label>
                  <DatePicker
                    date={checkOutDate}
                    onDateChange={handleCheckOutChange}
                    minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                    placeholder="dd/mm/yyyy"
                    buttonClassName="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Guests</label>
                  <Select
                    value={String(guests)}
                    onValueChange={(val) => setGuests(parseInt(val || "1", 10))}
                  >
                    <SelectTrigger className="h-11! w-full rounded-xl border border-input bg-background px-3 text-sm transition justify-between">
                      <SelectValue placeholder="1 guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxCapacity }, (_, index) => index + 1).map(
                        (count) => (
                          <SelectItem key={count} value={String(count)}>
                            {count} {count === 1 ? "guest" : "guests"}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBook}
                disabled={!isBookable}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBookable ? (
                  <>
                    Continue to checkout
                    <ArrowRight className="size-4" />
                  </>
                ) : (
                  "Currently Unavailable"
                )}
              </button>

              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-xs text-muted-foreground">
                <p className="font-medium text-foreground">15-Minute Guaranteed Lock</p>
                <p className="mt-0.5">
                  Your room will be blocked for 15 minutes during SSLCommerz payment.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Velora Hotels & Suites</p>
                <p className="mt-1 text-muted-foreground">
                  Premium hospitality in the heart of Bangladesh.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            onClick={previousImage}
            className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft />
          </button>

          <div className="relative h-[80vh] w-full max-w-6xl">
            <Image
              src={imageUrls[activeImage] || DEFAULT_IMAGE}
              alt={room.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-md">
            {activeImage + 1} / {imageUrls.length}
          </div>
        </div>
      )}

      {/* Guest Reviews Modal */}
      <RoomReviewsModal
        open={isReviewsModalOpen}
        roomId={room.id}
        roomName={room.name}
        averageRating={room.averageRating}
        totalReviews={room.totalReviews}
        onClose={() => setIsReviewsModalOpen(false)}
      />
    </main>
  );
}
