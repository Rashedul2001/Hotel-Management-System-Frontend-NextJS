"use client";

import { motion } from "motion/react";
import {
  ArrowUpRight,
  BedDouble,
  Maximize,
  Star,
  Users,
} from "lucide-react";

import { rooms } from "@/lib/hotel-mock-data";
import { formatCurrency } from "@/lib/utils";

export function FeaturedRooms() {
  return (
    <section id="rooms" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Stay your way"
          title="Rooms made for slowing down."
          description="From intimate escapes to expansive suites, every room is designed around comfort, calm, and considered details."
        />

        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {rooms.map((room, index) => (
            <motion.article
              key={room.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group overflow-hidden rounded-[2rem] border bg-card shadow-sm transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[1.15] overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  {room.popular ? (
                    <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                      Most loved
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <Star className="size-3.5 fill-current" />
                    {room.rating}
                  </span>
                </div>

                <button
                  aria-label={`View ${room.name}`}
                  className="absolute bottom-5 right-5 flex size-11 translate-y-3 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <ArrowUpRight className="size-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      {room.category}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl">
                      {room.name}
                    </h3>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-2xl font-semibold">
                      {formatCurrency(room.price)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      per night
                    </span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {room.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-4 border-t pt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Maximize className="size-4" />
                    {room.size}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <BedDouble className="size-4" />
                    {room.bed}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    {room.guests} guests
                  </span>
                </div>

                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted">
                  Explore room
                  <ArrowUpRight className="size-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
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

      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}