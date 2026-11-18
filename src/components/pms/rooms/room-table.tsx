"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FaBed,
  FaCheck,
  FaUsers,
  FaBroom,
  FaGear,
  FaCircleExclamation,
  FaEye,
  FaPen,
  FaTrash,
  FaRotate,
  FaPlus,
} from "react-icons/fa6";
import type { Room, RoomStatus } from "@/types/room";
import {
  ROOM_STATUSES,
  formatCurrency,
  statusClasses,
} from "./room-constants";

interface RoomTableProps {
  rooms: Room[];
  totalRooms: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  hasFilters: boolean;
  onRefresh: () => void;
  onClearFilters: () => void;
  onAddRoom: () => void;
  onView: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onStatusChange: (room: Room, newStatus: RoomStatus) => void;
}

function statusIcon(status: string) {
  switch (status) {
    case "Available":
      return <FaCheck className="w-3 h-3 text-emerald-600" />;
    case "Occupied":
      return <FaUsers className="w-3 h-3 text-blue-600" />;
    case "Cleaning":
      return <FaBroom className="w-3 h-3 text-amber-600" />;
    case "Maintenance":
      return <FaGear className="w-3 h-3 text-orange-600" />;
    case "Blocked":
      return <FaCircleExclamation className="w-3 h-3 text-red-600" />;
    default:
      return null;
  }
}

function getFirstImageUrl(room: Room): string | null {
  return room.images?.[0]?.imageUrl ?? null;
}

export function RoomTable({
  rooms,
  totalRooms,
  loading,
  error,
  actionLoading,
  hasFilters,
  onRefresh,
  onClearFilters,
  onAddRoom,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: RoomTableProps) {
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  const toggleStatusMenu = (roomId: string) => {
    setOpenStatusMenuId((curr) => (curr === roomId ? null : roomId));
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center bg-card rounded-2xl border border-border">
        <FaCircleExclamation className="text-destructive text-3xl" />
        <h3 className="mt-4 font-semibold text-foreground">
          Unable to load rooms
        </h3>
        <p className="mt-1 max-w-md text-muted-foreground text-sm">{error}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-primary hover:opacity-90 mt-5 px-4 rounded-xl h-10 font-semibold text-primary-foreground text-xs"
        >
          <FaRotate />
          Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card shadow-sm border border-border rounded-2xl p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-muted rounded-xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center px-6 py-16 text-center bg-card rounded-2xl border border-border">
        <div className="flex justify-center items-center bg-muted rounded-2xl w-14 h-14 text-muted-foreground">
          <FaBed className="text-2xl" />
        </div>
        <h3 className="mt-4 font-semibold text-foreground text-base">No rooms found</h3>
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          {hasFilters
            ? "Try changing or clearing your search filters."
            : "No rooms have been added to the inventory yet."}
        </p>
        <div className="flex gap-2 mt-5">
          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="hover:bg-accent px-4 border border-border rounded-xl h-10 font-medium text-xs transition"
            >
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={onAddRoom}
            className="inline-flex items-center gap-2 bg-primary hover:opacity-90 px-4 rounded-xl h-10 font-semibold text-primary-foreground text-xs transition"
          >
            <FaPlus />
            Add Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden">
      {/* Table Header Banner */}
      <div className="flex justify-between items-center px-4 md:px-6 py-4 border-border border-b">
        <div>
          <h2 className="font-semibold text-foreground">Room Inventory</h2>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {totalRooms} room{totalRooms !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs">
          <FaBed />
          Live room inventory
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/40 border-border border-b text-muted-foreground text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Room</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Floor</th>
              <th className="px-6 py-4 font-semibold">Capacity & Beds</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rooms.map((room) => {
              const photo = getFirstImageUrl(room);
              const isMenuOpen = openStatusMenuId === room.id;

              return (
                <tr key={room.id} className="group hover:bg-muted/30 transition">
                  {/* Room name & photo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex justify-center items-center bg-muted rounded-xl w-12 h-12 overflow-hidden shrink-0 border border-border">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={room.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <FaBed className="text-muted-foreground w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onView(room)}
                          className="font-semibold text-foreground hover:text-primary text-sm text-left truncate block"
                        >
                          Room {room.roomNumber}
                        </button>
                        <p className="max-w-[220px] text-muted-foreground text-xs truncate">
                          {room.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="bg-muted px-2.5 py-1 rounded-lg font-medium text-foreground text-xs">
                      {room.category}
                    </span>
                  </td>

                  {/* Floor */}
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    Floor {room.floor}
                  </td>

                  {/* Capacity & Beds */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-foreground text-sm">
                      <FaUsers className="text-muted-foreground text-xs" />
                      {room.capacity} guests
                    </div>
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      {room.bedCount} × {room.bedType}
                    </p>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground text-sm">
                      {formatCurrency(room.price)}
                    </p>
                    <p className="text-muted-foreground text-xs">per night</p>
                  </td>

                  {/* Status Dropdown */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => toggleStatusMenu(room.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${statusClasses(
                          room.status,
                        )}`}
                      >
                        {statusIcon(room.status)}
                        {room.status}
                      </button>

                      {isMenuOpen && (
                        <div className="top-full left-0 z-30 absolute bg-card shadow-xl mt-1.5 p-1.5 border border-border rounded-xl w-44 text-card-foreground">
                          {ROOM_STATUSES.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                toggleStatusMenu(room.id);
                                onStatusChange(room, st);
                              }}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-accent ${
                                st === room.status ? "font-semibold bg-accent/50" : ""
                              }`}
                            >
                              {statusIcon(st)}
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(room)}
                        title="View details"
                        aria-label={`View room ${room.roomNumber}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition text-sm"
                      >
                        <FaEye />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(room)}
                        title="Edit room"
                        aria-label={`Edit room ${room.roomNumber}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition text-sm"
                      >
                        <FaPen />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(room)}
                        title="Delete room"
                        aria-label={`Delete room ${room.roomNumber}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 transition text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {rooms.map((room) => {
          const photo = getFirstImageUrl(room);

          return (
            <div key={room.id} className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="relative bg-muted rounded-xl w-20 h-20 overflow-hidden shrink-0 border border-border">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <FaBed className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => onView(room)}
                        className="font-semibold text-foreground text-sm text-left block"
                      >
                        Room {room.roomNumber}
                      </button>
                      <p className="mt-0.5 text-muted-foreground text-xs truncate">
                        {room.name}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClasses(
                        room.status,
                      )}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-muted-foreground text-xs">
                    <span>{room.category}</span>
                    <span>Floor {room.floor}</span>
                    <span>{room.capacity} guests</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(room.price)}/night
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onView(room)}
                  className="flex flex-1 justify-center items-center gap-1.5 hover:bg-accent border border-border rounded-xl h-9 font-medium text-foreground text-xs transition"
                >
                  <FaEye />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(room)}
                  className="flex flex-1 justify-center items-center gap-1.5 hover:bg-accent border border-border rounded-xl h-9 font-medium text-foreground text-xs transition"
                >
                  <FaPen />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(room)}
                  aria-label="Delete room"
                  className="flex justify-center items-center hover:bg-destructive/10 border border-destructive/20 rounded-xl w-10 h-9 text-destructive transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
