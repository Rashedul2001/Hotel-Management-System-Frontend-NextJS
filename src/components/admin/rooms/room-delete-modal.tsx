"use client";

import React, { useEffect } from "react";
import { FaTrash } from "react-icons/fa6";
import type { Room } from "@/types/room";

interface RoomDeleteModalProps {
  room: Room | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RoomDeleteModal({
  room,
  loading,
  onClose,
  onConfirm,
}: RoomDeleteModalProps) {
  useEffect(() => {
    if (!room) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [room, loading, onClose]);

  if (!room) return null;

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card shadow-2xl p-6 border border-border rounded-2xl w-full max-w-md text-card-foreground">
        <div className="flex justify-center items-center bg-destructive/10 rounded-xl w-12 h-12 text-destructive">
          <FaTrash />
        </div>

        <h2 className="mt-5 font-bold text-foreground text-lg">Delete Room?</h2>

        <p className="mt-2 text-muted-foreground text-sm leading-6">
          You are about to delete{" "}
          <span className="font-semibold text-foreground">
            Room {room.roomNumber} ({room.name})
          </span>
          . This action cannot be undone and will permanently remove room details and photos.
        </p>

        <div className="flex sm:flex-row flex-col-reverse sm:justify-end gap-2 mt-6">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="hover:bg-accent disabled:opacity-50 px-5 border border-border rounded-xl h-10 font-medium text-foreground text-sm transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex justify-center items-center gap-2 bg-destructive hover:bg-destructive/90 disabled:opacity-60 px-5 rounded-xl h-10 font-semibold text-destructive-foreground text-sm transition"
          >
            {loading && (
              <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
            )}
            Delete Room
          </button>
        </div>
      </div>
    </div>
  );
}
