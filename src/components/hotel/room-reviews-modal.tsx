"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  X,
  MessageSquare,
  Sparkles,
  Loader2,
  Calendar,
  User,
  Quote,
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getRoomReviews, type ReviewItem } from "@/lib/settings-api";

interface RoomReviewsModalProps {
  open: boolean;
  roomId: string;
  roomName: string;
  averageRating: number;
  totalReviews: number;
  onClose: () => void;
}

export function RoomReviewsModal({
  open,
  roomId,
  roomName,
  averageRating,
  totalReviews,
  onClose,
}: RoomReviewsModalProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !roomId) return;

    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoomReviews(roomId);
        if (isMounted) {
          setReviews(data.reviews || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Unable to load reviews.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [open, roomId]);

  if (!open) return null;

  const displayRating = averageRating ? averageRating.toFixed(1) : "5.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 pr-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <MessageSquare className="size-4" />
              Verified Guest Reviews
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-foreground">
              {roomName}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Authentic guest feedback collected from checked-out stays at Hotel Velora.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3.5 border border-border shrink-0 self-start sm:self-auto">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-lg">
              <Star className="size-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg text-foreground">
                {displayRating} <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {totalReviews} verified review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs">Loading guest reviews...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-destructive bg-destructive/10 rounded-2xl p-4">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Quote className="size-10 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No guest reviews yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Be the first guest to experience {roomName} and leave a review after your checkout.
            </p>
          </div>
        ) : (
          <div className="relative px-2 sm:px-4">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {reviews.map((rev) => (
                  <CarouselItem
                    key={rev.id}
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="flex flex-col justify-between h-full rounded-2xl border border-border bg-muted/30 p-5 shadow-xs transition hover:border-primary/40 hover:bg-muted/50 group">
                      <div className="space-y-3">
                        {/* Rating and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>

                          <span className="text-[11px] text-muted-foreground">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent stay"}
                          </span>
                        </div>

                        {/* Comment text */}
                        <p className="text-xs text-foreground/90 leading-relaxed italic line-clamp-6">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Guest Info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                          {rev.userAvatar ? (
                            <Image
                              src={rev.userAvatar}
                              alt={rev.userName}
                              width={32}
                              height={32}
                              className="size-8 rounded-full object-cover"
                            />
                          ) : (
                            rev.userName?.charAt(0) || "G"
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {rev.userName || "Verified Guest"}
                          </p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <Sparkles className="size-2.5" />
                            Verified Stay
                          </span>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation controls */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <CarouselPrevious className="relative inset-auto translate-y-0 size-8 rounded-xl border border-border" />
                <CarouselNext className="relative inset-auto translate-y-0 size-8 rounded-xl border border-border" />
              </div>
            </Carousel>
          </div>
        )}

        {/* Modal Footer Note */}
        <div className="border-t border-border pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Guests can review their stay from the "Past Bookings" section after completing their stay at Hotel Velora.
          </p>
        </div>
      </div>
    </div>
  );
}
