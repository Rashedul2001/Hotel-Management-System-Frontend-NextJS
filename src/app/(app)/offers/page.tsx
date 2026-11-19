"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Gift,
  HelpCircle,
  Loader2,
  BedDouble,
  Clock,
} from "lucide-react";
import { getActiveOffers, type OfferItem } from "@/lib/settings-api";

export default function AllOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getActiveOffers();
        if (isMounted) {
          setOffers(data);
        }
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Editorial Header */}
      <section className="relative overflow-hidden border-b border-border bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-5">
            <Gift className="size-3.5" />
            Curated Hotel Packages & Rate Reductions
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto">
            Exclusive Stays & Seasonal Offers
          </h1>

          <p className="mt-6 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience the unrivaled hospitality of Hotel Velora with special privileges. Select any offer below to view eligible rooms with automatically reduced booking rates.
          </p>
        </div>
      </section>

      {/* Offers Collection Grid */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-16">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="aspect-[1.3] w-full rounded-2xl bg-muted" />
                <div className="h-6 w-1/3 bg-muted rounded" />
                <div className="h-8 w-2/3 bg-muted rounded" />
                <div className="h-16 w-full bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center text-muted-foreground bg-card">
            <Gift className="size-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Active Offers Right Now</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Please check back soon for seasonal holiday packages, early bird discounts, and executive suite experiences.
            </p>
            <div className="mt-6">
              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Explore All Rooms
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const offerLink = offer.roomId
                ? `/rooms/${offer.roomId}?offerId=${offer.id}`
                : offer.category
                ? `/rooms?category=${encodeURIComponent(offer.category)}&offerId=${offer.id}`
                : `/rooms?offerId=${offer.id}`;

              const targetLabel = offer.roomId
                ? `Specific Room: ${offer.roomName || "Featured Room"}`
                : offer.category
                ? `${offer.category} Category Rooms`
                : "All Property Rooms";

              return (
                <article
                  key={offer.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-xs transition hover:shadow-xl hover:border-primary/40"
                >
                  <div>
                    {/* Visual Photo Card */}
                    <div className="relative aspect-[1.3] overflow-hidden">
                      <Image
                        src={offer.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"}
                        alt={offer.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-md">
                          {offer.discount}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur font-medium">
                          <BedDouble className="size-3.5 text-amber-300" />
                          {targetLabel}
                        </span>

                        {offer.validUntil && (
                          <span className="flex items-center gap-1 text-[11px] text-white/90 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur">
                            <Clock className="size-3 text-white/80" />
                            Valid until {new Date(offer.validUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition">
                        {offer.title}
                      </h3>

                      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {offer.description}
                      </p>
                    </div>
                  </div>

                  {/* Direct Action Link */}
                  <div className="p-6 pt-0 mt-auto border-t border-border/60">
                    <div className="pt-4">
                      <Link
                        href={offerLink}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 group/btn"
                      >
                        {offer.roomId ? "Book Room with this Offer" : "Explore Rooms with Offer"}
                        <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Offer Terms & FAQ Section */}
      <section className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10 pt-24">
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="size-4" />
            Automatic Offer Redemption
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
            How Special Offers Work at Hotel Velora
          </h2>

          <div className="grid gap-6 sm:grid-cols-3 text-xs text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                1. Select an Offer
              </span>
              <p>
                Click any promotional card above to automatically view eligible rooms and suites tailored to that specific tier or villa.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                2. Automatic Rate Reduction
              </span>
              <p>
                No promo codes required. The discount is seamlessly applied to your nightly stay rate and validated by our server during checkout.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                3. Arrival Privileges
              </span>
              <p>
                Included perks such as complimentary champagne, spa credits, or late checkout are honored upon arrival by our front desk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
