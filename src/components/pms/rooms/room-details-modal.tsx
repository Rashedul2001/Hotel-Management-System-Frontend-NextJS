"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  FaBed,
  FaChevronLeft,
  FaChevronRight,
  FaPen,
  FaXmark,
} from "react-icons/fa6";
import type { Room } from "@/types/room";
import { formatCurrency, formatDate, statusClasses } from "./room-constants";

interface RoomDetailsModalProps {
  room: Room | null;
  onClose: () => void;
  onEdit: (room: Room) => void;
}

export function RoomDetailsModal({
  room,
  onClose,
  onEdit,
}: RoomDetailsModalProps) {
  if (!room) return null;

  return (
    <RoomDetailsContent
      key={room.id}
      room={room}
      onClose={onClose}
      onEdit={onEdit}
    />
  );
}

function RoomDetailsContent({
  room,
  onClose,
  onEdit,
}: {
  room: Room;
  onClose: () => void;
  onEdit: (room: Room) => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = room.images ?? [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[activeImageIndex]?.imageUrl : null;

  const handleNextImage = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleNextImage, handlePrevImage]);

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-3 md:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col bg-card shadow-2xl border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden text-card-foreground">
        {/* Image Showcase with Circular Navigation */}
        <div className="group relative bg-muted h-64 sm:h-80 overflow-hidden shrink-0 select-none">
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${room.name} image ${activeImageIndex + 1}`}
              fill
              priority
              className="object-cover transition duration-300"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
              <FaBed className="text-5xl" />
              <p className="mt-2 font-medium text-xs">No photos uploaded for this room</p>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="top-3 right-3 z-10 absolute flex justify-center items-center bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full w-9 h-9 text-white transition"
          >
            <FaXmark />
          </button>

          {/* Next / Prev Circular Arrow Buttons (shown if > 1 image) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous photo"
                className="top-1/2 left-3 z-10 absolute flex justify-center items-center bg-black/40 hover:bg-black/75 backdrop-blur-md rounded-full w-10 h-10 text-white -translate-y-1/2 transition shadow-md hover:scale-105"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next photo"
                className="top-1/2 right-3 z-10 absolute flex justify-center items-center bg-black/40 hover:bg-black/75 backdrop-blur-md rounded-full w-10 h-10 text-white -translate-y-1/2 transition shadow-md hover:scale-105"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Room Title & Badge Header */}
          <div className="right-4 bottom-4 left-4 z-10 absolute text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-semibold text-xs">
                Room {room.roomNumber}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClasses(
                  room.status,
                )}`}
              >
                {room.status}
              </span>
            </div>

            <h2 className="mt-1.5 font-bold text-xl sm:text-2xl drop-shadow-sm truncate">
              {room.name}
            </h2>

            <p className="mt-0.5 text-white/80 text-xs sm:text-sm">
              {room.category} · Floor {room.floor}
            </p>
          </div>

          {/* Circular Indicator Dots (click to circle next image) */}
          {images.length > 1 && (
            <div className="bottom-2 left-1/2 z-20 absolute flex items-center gap-1.5 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={`rounded-full transition-all ${
                    idx === activeImageIndex
                      ? "h-2.5 w-6 bg-white shadow-sm"
                      : "h-2.5 w-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip (if multiple images) */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border overflow-x-auto shrink-0">
            {images.map((img, idx) => (
              <button
                key={img.id ?? idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative h-12 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                  idx === activeImageIndex
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Key Metrics */}
          <div className="gap-3 grid grid-cols-2 md:grid-cols-4">
            <div className="bg-muted/40 p-3 border border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Price
              </p>
              <p className="mt-1 font-semibold text-foreground text-sm">
                {formatCurrency(room.price)}
                <span className="text-muted-foreground font-normal text-xs">/night</span>
              </p>
            </div>

            <div className="bg-muted/40 p-3 border border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Capacity
              </p>
              <p className="mt-1 font-semibold text-foreground text-sm">
                Up to {room.capacity} guests
              </p>
            </div>

            <div className="bg-muted/40 p-3 border border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Bed Configuration
              </p>
              <p className="mt-1 font-semibold text-foreground text-sm">
                {room.bedCount} × {room.bedType}
              </p>
            </div>

            <div className="bg-muted/40 p-3 border border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Room Size
              </p>
              <p className="mt-1 font-semibold text-foreground text-sm">
                {room.size} m²
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground text-sm">Description</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
              {room.description || "No description has been added for this room."}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Amenities ({room.amenities?.length ?? 0})
            </h3>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    ✓ {amenity.name}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground text-xs">No amenities assigned yet.</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="gap-3 grid sm:grid-cols-2 pt-4 border-border border-t text-muted-foreground text-xs">
            <p>
              Created:{" "}
              <span className="font-medium text-foreground">
                {formatDate(room.createdAt)}
              </span>
            </p>
            <p className="sm:text-right">
              Last Updated:{" "}
              <span className="font-medium text-foreground">
                {formatDate(room.updatedAt ?? room.UpdatedAt)}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex sm:flex-row flex-col-reverse sm:justify-end gap-2 p-4 bg-muted/20 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-accent px-5 border border-border rounded-xl h-10 font-medium text-foreground text-sm transition"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit(room)}
            className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 px-5 rounded-xl h-10 font-semibold text-primary-foreground text-sm transition"
          >
            <FaPen className="w-3.5 h-3.5" />
            Edit Room
          </button>
        </div>
      </div>
    </div>
  );
}
