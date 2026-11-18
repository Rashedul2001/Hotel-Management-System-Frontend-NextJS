"use client";

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface RoomPaginationProps {
  pageNumber: number;
  pageSize: number;
  totalRooms: number;
  totalPages: number;
  currentCount?: number;
  onPageChange: (newPage: number) => void;
}

export function RoomPagination({
  pageNumber,
  pageSize,
  totalRooms,
  totalPages,
  currentCount,
  onPageChange,
}: RoomPaginationProps) {
  if (totalRooms === 0) return null;

  const count =
    typeof currentCount === "number"
      ? currentCount
      : Math.min(pageSize, Math.max(0, totalRooms - (pageNumber - 1) * pageSize));
  const fromNumber = count > 0 && totalRooms > 0 ? (pageNumber - 1) * pageSize + 1 : 0;
  const toNumber = count > 0 && totalRooms > 0 ? Math.min(fromNumber + count - 1, totalRooms) : 0;

  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 px-4 md:px-6 py-4 bg-card border-border border-t rounded-b-2xl">
      <p className="text-muted-foreground text-xs">
        Showing <span className="font-semibold text-foreground">{fromNumber}</span> to{" "}
        <span className="font-semibold text-foreground">{toNumber}</span> of{" "}
        <span className="font-semibold text-foreground">{totalRooms}</span> rooms
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          className="inline-flex items-center gap-1.5 hover:bg-accent disabled:opacity-40 px-3 border border-border rounded-xl h-9 text-foreground text-xs transition disabled:cursor-not-allowed"
        >
          <FaChevronLeft className="w-3 h-3" />
          Previous
        </button>

        <span className="text-muted-foreground text-xs px-2">
          Page {pageNumber} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          disabled={pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
          className="inline-flex items-center gap-1.5 hover:bg-accent disabled:opacity-40 px-3 border border-border rounded-xl h-9 text-foreground text-xs transition disabled:cursor-not-allowed"
        >
          Next
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
