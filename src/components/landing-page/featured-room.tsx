"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BedDouble,
  Maximize,
  Star,
  Users,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

const DEFAULT_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85";

export function FeaturedRooms() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFeaturedRooms() {
      try {
        setLoading(true);
        // Try fetching rooms with isFeatured=true
        const res = await apiFetch("/api/rooms?isFeatured=true&pageSize=6");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.rooms || [];
          if (items.length > 0 && isMounted) {
            setFeaturedRooms(items);
            return;
          }
        }

        // If none marked as featured yet, fetch latest available rooms
        const fallbackRes = await apiFetch("/api/rooms?pageSize=3");
        if (fallbackRes.ok && isMounted) {
          const fallbackData = await fallbackRes.json();
          const fallbackItems = Array.isArray(fallbackData) ? fallbackData : fallbackData?.rooms || [];
          setFeaturedRooms(fallbackItems);
        }
      } catch (err) {
        console.warn("[FeaturedRooms] Failed to load from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeaturedRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="rooms" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Stay your way"
          title="Rooms made for slowing down."
          description="From intimate escapes to expansive suites, every room is designed around comfort, calm, and considered details."
        />

        {loading ? (
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="aspect-[1.15] w-full rounded-2xl bg-muted" />
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-6 w-2/3 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : featuredRooms.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p>No featured rooms currently available. Check back soon.</p>
            <Link
              href="/rooms"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground"
            >
              Browse All Rooms
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {featuredRooms.map((room, index) => {
              const mainImage = room.images?.[0]?.imageUrl || DEFAULT_ROOM_IMAGE;
              const ratingDisplay = room.averageRating ? room.averageRating.toFixed(1) : "5.0";

              return (
                <motion.article
                  key={room.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="group flex flex-col h-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[1.15] shrink-0 overflow-hidden">
                    <img
                      src={mainImage}
                      alt={room.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                      {room.isFeatured ? (
                        <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur text-foreground">
                          Featured
                        </span>
                      ) : (
                        <span />
                      )}

                      <span className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur text-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {ratingDisplay}
                        <span className="text-[11px] text-muted-foreground font-normal">
                          ({room.totalReviews || 0})
                        </span>
                      </span>
                    </div>

                    <Link
                      href={`/rooms/${room.id}`}
                      aria-label={`View ${room.name}`}
                      className="absolute bottom-5 right-5 flex size-11 translate-y-3 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <ArrowUpRight className="size-5" />
                    </Link>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            {room.category}
                          </p>

                          <h3 className="mt-2 font-serif text-2xl text-foreground line-clamp-1 min-h-[2rem]">
                            {room.name}
                          </h3>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-2xl font-semibold text-foreground">
                            {formatCurrency(room.price)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            per night
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                        {room.description
                          ? room.description.length > 105
                            ? `${room.description.slice(0, 105)}...`
                            : room.description
                          : "Quiet luxury coastal sanctuary with personalized hospitality..."}
                      </p>
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Maximize className="size-4 text-primary" />
                          {room.size} sq m
                        </span>

                        <span className="flex items-center gap-1.5">
                          <BedDouble className="size-4 text-primary" />
                          {room.bedCount} {room.bedType}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users className="size-4 text-primary" />
                          {room.capacity} guests
                        </span>
                      </div>

                      {/* View Details link beside Explore Rooms link - Constant bottom height */}
                      <div className="mt-6 flex gap-3">
                        <Link
                          href={`/rooms/${room.id}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-3 text-xs sm:text-sm font-semibold transition-colors hover:bg-muted text-foreground"
                        >
                          View details
                          <ArrowUpRight className="size-4" />
                        </Link>
                        <Link
                          href="/rooms"
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-3 text-xs sm:text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          Explore rooms
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
        {eyebrow}
      </p>

      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl text-foreground">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
