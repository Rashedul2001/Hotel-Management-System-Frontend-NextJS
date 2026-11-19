"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMaximize2,
  FiMapPin,
} from "react-icons/fi";
import {
  getGalleryImages,
  getGalleryCategories,
  type GalleryImageItem,
} from "@/lib/gallery-api";
import {
  openGoogleMapsDirections,
  HOTEL_OFFICIAL_ADDRESS,
} from "@/lib/directions";

const DEFAULT_CATEGORIES: string[] = [
  "All",
  "Rooms",
  "Dining",
  "Wellness",
  "Exterior",
  "Experiences",
];

const INITIAL_GALLERY_IMAGES: GalleryImageItem[] = [
  {
    id: 1,
    title: "The Presidential Suite",
    category: "Rooms",
    description:
      "A spacious retreat designed with refined details, natural textures, and panoramic views.",
    src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=85",
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=85",
    featured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Velora Grand Lobby",
    category: "Exterior",
    description:
      "An elegant arrival experience surrounded by warm lighting and contemporary architecture.",
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Deluxe King Room",
    category: "Rooms",
    description:
      "Thoughtfully designed accommodation for peaceful nights and relaxed mornings.",
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Signature Dining",
    category: "Dining",
    description:
      "Seasonal cuisine and memorable evenings in an intimate dining setting.",
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    title: "Infinity Pool",
    category: "Wellness",
    description:
      "A tranquil space to unwind while enjoying the atmosphere of Velora.",
    src: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    title: "Executive Suite",
    category: "Rooms",
    description:
      "A sophisticated suite combining comfort, privacy, and modern luxury.",
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: "Rooftop Evening",
    category: "Experiences",
    description:
      "Golden-hour views and unforgettable moments above the city.",
    src: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    title: "Velora Breakfast",
    category: "Dining",
    description:
      "Start the day with fresh ingredients, crafted dishes, and exceptional coffee.",
    src: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 9,
    title: "Spa Sanctuary",
    category: "Wellness",
    description:
      "A calm sanctuary dedicated to relaxation and restoration.",
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 10,
    title: "Poolside Retreat",
    category: "Experiences",
    description:
      "Slow afternoons, refreshing water, and comfortable spaces made for unwinding.",
    src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 11,
    title: "Velora Exterior",
    category: "Exterior",
    description:
      "Contemporary architecture meets timeless hospitality.",
    src: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 11,
    createdAt: new Date().toISOString(),
  },
  {
    id: 12,
    title: "Evening Lounge",
    category: "Experiences",
    description:
      "An inviting setting for conversations, cocktails, and relaxed evenings.",
    src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1400&q=85",
    imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1400&q=85",
    featured: false,
    displayOrder: 12,
    createdAt: new Date().toISOString(),
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>(INITIAL_GALLERY_IMAGES);
  const [selectedImage, setSelectedImage] = useState<GalleryImageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic gallery pictures from backend
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [imagesData, categoriesData] = await Promise.all([
          getGalleryImages(),
          getGalleryCategories(),
        ]);
        if (isMounted) {
          if (Array.isArray(imagesData) && imagesData.length > 0) {
            setGalleryImages(imagesData);
          }
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            const catSet = new Set(["All", ...categoriesData]);
            setCategories(Array.from(catSet));
          }
        }
      } catch (err) {
        console.warn("Could not load gallery images from backend, using initial set:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") {
      return galleryImages;
    }

    return galleryImages.filter(
      (image) => image.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [galleryImages, activeCategory]);

  const selectedIndex = selectedImage
    ? filteredImages.findIndex((image) => image.id === selectedImage.id)
    : -1;

  const showPrevious = useCallback(() => {
    if (selectedIndex === -1 || filteredImages.length === 0) return;

    const previousIndex =
      selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1;

    setSelectedImage(filteredImages[previousIndex]);
  }, [selectedIndex, filteredImages]);

  const showNext = useCallback(() => {
    if (selectedIndex === -1 || filteredImages.length === 0) return;

    const nextIndex =
      selectedIndex === filteredImages.length - 1 ? 0 : selectedIndex + 1;

    setSelectedImage(filteredImages[nextIndex]);
  }, [selectedIndex, filteredImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
      if (e.key === "ArrowLeft") showPrevious();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, showPrevious, showNext]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ================================================================ */}
      {/* Hero                                                             */}
      {/* ================================================================ */}

      <section className="relative overflow-hidden">
        <div className="relative min-h-[520px] sm:min-h-[580px]">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2200&q=90"
            alt="Velora Hotels exterior"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/20" />

          {/* Hero content */}
          <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-end px-4 pb-16 sm:min-h-[580px] sm:px-6 sm:pb-20 lg:px-8">
            <div className="max-w-3xl text-white">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-white/75">
                <span className="h-px w-8 bg-white/60" />
                Velora Hotels
              </div>

              <h1 className="hotel-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
                A glimpse into
                <span className="block italic font-normal">
                  the Velora experience.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Explore the rooms, spaces, dining experiences, and
                thoughtful details that make every stay at Velora
                memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Intro                                                            */}
      {/* ================================================================ */}

      <section className="hotel-section">
        <div className="hotel-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Discover Velora
              </p>

              <h2 className="hotel-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Spaces designed to be remembered.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                From peaceful mornings in your suite to long evenings
                around the table, every corner of Velora is designed
                with comfort, character, and thoughtful hospitality
                in mind.
              </p>
            </div>

            <Link
              href="/rooms"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              Explore Rooms
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Category Filters                                                  */}
      {/* ================================================================ */}

      <section className="pb-8">
        <div className="hotel-container">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => {
              const active = activeCategory.toLowerCase() === category.toLowerCase();

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`
                    shrink-0 rounded-full px-5 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Gallery                                                           */}
      {/* ================================================================ */}

      <section className="pb-24 sm:pb-32">
        <div className="hotel-container">
          <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[280px]">
            {filteredImages.map((image, index) => {
              /*
               * Create a visual rhythm by making featured images
               * larger on larger screens.
               */
              const featured =
                image.featured ||
                index === 0 ||
                (index === 5 && filteredImages.length > 8);

              const imgSrc = image.imageUrl || image.src;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`
                    group relative overflow-hidden rounded-2xl text-left
                    ${featured ? "sm:col-span-2 sm:row-span-2" : ""}
                  `}
                >
                  <Image
                    src={imgSrc}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={
                      featured
                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 66vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

                  {/* Expand icon */}
                  <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <FiMaximize2 className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                      {image.category}
                    </p>

                    <h3
                      className={`
                        hotel-display font-semibold
                        ${featured ? "text-2xl sm:text-3xl" : "text-xl"}
                      `}
                    >
                      {image.title}
                    </h3>

                    {featured && image.description && (
                      <p className="mt-2 max-w-lg text-sm leading-6 text-white/70 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredImages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground text-sm">
                No pictures currently available for &ldquo;{activeCategory}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* Experience CTA                                                   */}
      {/* ================================================================ */}

      <section className="pb-24 sm:pb-32">
        <div className="hotel-container">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-10 sm:py-16 lg:px-16">
            <div className="relative z-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
                Experience Velora
              </p>

              <h2 className="hotel-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Pictures are only the beginning.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-primary-foreground/70 sm:text-base">
                Come experience the atmosphere, hospitality, and
                thoughtful details for yourself.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rooms"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-background/90"
                >
                  Find Your Room
                  <FiArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/20 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
                >
                  Contact Velora
                </Link>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-primary-foreground/10" />
            <div className="absolute -bottom-32 -right-12 h-80 w-80 rounded-full border border-primary-foreground/10" />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Location strip                                                    */}
      {/* ================================================================ */}

      <section className="border-y border-border bg-muted/30">
        <div className="hotel-container py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiMapPin className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Velora Hotels & Suites
                </p>

                <p className="text-xs text-muted-foreground">
                  {HOTEL_OFFICIAL_ADDRESS}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openGoogleMapsDirections()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
              title="Get Google Maps direction from current location"
            >
              Get directions
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Lightbox Modal                                                    */}
      {/* ================================================================ */}

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          onClick={() => setSelectedImage(null)}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-8 sm:top-8"
          >
            <FiX className="h-5 w-5" />
          </button>

          {/* Previous */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-6"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[75vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage.imageUrl || selectedImage.src}
              alt={selectedImage.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-5 pt-20 sm:px-8 sm:pb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                {selectedImage.category}
              </p>

              <h3 className="hotel-display mt-1 text-2xl font-semibold text-white sm:text-3xl">
                {selectedImage.title}
              </h3>

              {selectedImage.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  {selectedImage.description}
                </p>
              )}

              <p className="mt-3 text-xs text-white/40">
                {selectedIndex + 1} / {filteredImages.length}
              </p>
            </div>
          </div>

          {/* Next */}
          {filteredImages.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6"
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </main>
  );
}
