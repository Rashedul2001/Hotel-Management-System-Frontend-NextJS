"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { getGalleryImages } from "@/lib/gallery-api";

const DEFAULT_GALLERY = [
  {
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
    title: "Quiet mornings",
  },
  {
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
    title: "Thoughtful spaces",
  },
  {
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85",
    title: "Poolside afternoons",
  },
  {
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85",
    title: "Evening atmosphere",
  },
  {
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
    title: "Rest well",
  },
];

export function HotelGallery() {
  const [items, setItems] = useState<{ image: string; title: string }[]>(DEFAULT_GALLERY);

  useEffect(() => {
    let isMounted = true;
    getGalleryImages()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length >= 5) {
          setItems(
            data.slice(0, 5).map((img) => ({
              image: img.imageUrl || img.src,
              title: img.title,
            }))
          );
        }
      })
      .catch(() => {
        // Keep defaults if error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              A glimpse inside
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              Life at Velora.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Spaces designed to invite you to pause, reconnect, and enjoy the
              moment.
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
            >
              View Full Gallery <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={item.image + index}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              className={[
                "group relative overflow-hidden rounded-3xl",
                index === 0 ? "col-span-2 row-span-2 aspect-square" : "",
                index === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square",
              ].join(" ")}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />

              <span className="absolute bottom-5 left-5 translate-y-2 text-sm font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
