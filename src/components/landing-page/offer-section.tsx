"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Tag, Calendar, BedDouble } from "lucide-react";
import { getActiveOffers, type OfferItem } from "@/lib/settings-api";

export function OffersSection() {
  const [offersList, setOffersList] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchOffers() {
      try {
        setLoading(true);
        const data = await getActiveOffers();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setOffersList(data.slice(0, 4));
        }
      } catch (err) {
        console.warn("[OffersSection] Failed to load offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              Special moments
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl text-foreground">
              A little more, for less.
            </h2>
          </div>

          <Link
            href="/offers"
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition group"
          >
            View all offers
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[390px] rounded-[2rem] bg-muted animate-pulse border border-border"
              />
            ))}
          </div>
        ) : offersList.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
            <p>New promotional offers and luxury packages are arriving soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {offersList.map((offer, index) => {
              // Direct offer destination: Room details for specific room, or filtered rooms list for category
              const offerLink = offer.roomId
                ? `/rooms/${offer.roomId}?offerId=${offer.id}`
                : offer.category
                ? `/rooms?category=${encodeURIComponent(offer.category)}&offerId=${offer.id}`
                : `/rooms?offerId=${offer.id}`;

              const targetLabel = offer.roomId
                ? `Specific Room: ${offer.roomName || "Featured Room"}`
                : offer.category
                ? `${offer.category} Tier Offer`
                : "Curated Property Offer";

              return (
                <motion.article
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative min-h-[410px] overflow-hidden rounded-[2rem] border border-border shadow-sm flex flex-col justify-between"
                >
                  <img
                    src={offer.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"}
                    alt={offer.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

                  <div className="relative flex flex-col justify-between h-full p-7 text-white sm:p-9 z-10">
                    {/* Top Row: Discount & Target Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-bold backdrop-blur shadow-xs text-amber-300">
                          {offer.discount}
                        </span>

                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur text-white/90 flex items-center gap-1">
                          <BedDouble className="size-3" />
                          {targetLabel}
                        </span>
                      </div>

                      <span className="rounded-full bg-white/15 p-2.5 backdrop-blur shadow-xs">
                        <Tag className="size-4" />
                      </span>
                    </div>

                    {/* Bottom Content & Direct Action Link */}
                    <div className="pt-8">
                      <h3 className="font-serif text-3xl sm:text-4xl text-white">
                        {offer.title}
                      </h3>

                      <p className="mt-3 max-w-lg text-xs sm:text-sm leading-relaxed text-white/80 line-clamp-3">
                        {offer.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                          href={offerLink}
                          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-white/90 shadow-md group/btn"
                        >
                          {offer.roomId ? "View Room & Claim Offer" : "Explore Rooms with Offer"}
                          <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>

                        {offer.validUntil && (
                          <span className="text-[11px] text-white/70 flex items-center gap-1">
                            <Calendar className="size-3" />
                            Valid until {new Date(offer.validUntil).toLocaleDateString()}
                          </span>
                        )}
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
