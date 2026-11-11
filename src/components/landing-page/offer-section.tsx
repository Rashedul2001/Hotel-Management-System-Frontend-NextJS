"use client";

import { motion } from "motion/react";
import { ArrowRight, Copy, Tag } from "lucide-react";
import { successToast } from "@/components/ui/toast";

import { offers } from "@/lib/hotel-mock-data";

export function OffersSection() {
  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    successToast("Offer code copied", `${code} is ready to use.`);
  };

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              Special moments
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              A little more, for less.
            </h2>
          </div>

          <button className="flex items-center gap-2 text-sm font-semibold">
            View all offers
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {offers.map((offer, index) => (
            <motion.article
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative min-h-[390px] overflow-hidden rounded-[2rem]"
            >
              <img
                src={offer.image}
                alt={offer.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

              <div className="relative flex min-h-[390px] flex-col justify-between p-7 text-white sm:p-9">
                <div className="flex items-start justify-between">
                  <span className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold backdrop-blur">
                    {offer.discount}
                  </span>

                  <span className="rounded-full bg-white/15 p-3 backdrop-blur">
                    <Tag className="size-4" />
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-3xl sm:text-4xl">
                    {offer.title}
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">
                    {offer.description}
                  </p>

                  <button
                    onClick={() => copyCode(offer.code)}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    <Copy className="size-4" />
                    Copy {offer.code}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}