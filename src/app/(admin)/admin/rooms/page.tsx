"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
  updateRoomStatus,
  type RoomPayload,
} from "@/lib/admin-rooms-api";
import type { Room, RoomStatus } from "@/types/room";

import { RoomStats, type RoomStatistics } from "@/components/admin/rooms/room-stats";
import { RoomFilters } from "@/components/admin/rooms/room-filters";
import { RoomTable } from "@/components/admin/rooms/room-table";
import { RoomPagination } from "@/components/admin/rooms/room-pagination";
import CreateRoomModal, {
  type RoomFormValues,
} from "@/components/admin/rooms/create-room-modal";
import { RoomDetailsModal } from "@/components/admin/rooms/room-details-modal";
import { RoomDeleteModal } from "@/components/admin/rooms/room-delete-modal";
import { BED_TYPES } from "@/components/admin/rooms/room-constants";

const PAGE_SIZE = 7;

export default function RoomsPageClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL Query Parameters
  const [parameters, setParameters] = useQueryStates(
    {
      pageNumber: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(PAGE_SIZE),
      SearchTerm: parseAsString.withDefault(""),
      Status: parseAsString.withDefault("All"),
      Category: parseAsString.withDefault("All"),
    },
    { shallow: false },
  );

  // Modal Visibility States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Currently Selected / Editing Room
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Data Fetching
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRooms({
        pageNumber: parameters.pageNumber,
        pageSize: parameters.pageSize,
        searchTerm: parameters.SearchTerm.trim() || undefined,
        status:
          parameters.Status === "All"
            ? undefined
            : (parameters.Status as RoomStatus),
        category:
          parameters.Category === "All" ? undefined : parameters.Category,
      });

      setRooms(data.rooms);
      setTotalRooms(data.totalRooms);
      setError(null);

      const lastPage = Math.max(
        1,
        Math.ceil(data.totalRooms / parameters.pageSize),
      );
      if (parameters.pageNumber > lastPage) {
        await setParameters({ pageNumber: lastPage });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load rooms.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [
    parameters.Category,
    parameters.SearchTerm,
    parameters.Status,
    parameters.pageNumber,
    parameters.pageSize,
    setParameters,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRooms();
  }, [loadRooms]);

  // Derived Statistics
  const statistics = useMemo<RoomStatistics>(() => {
    return {
      total: totalRooms,
      available: rooms.filter((r) => r.status === "Available").length,
      occupied: rooms.filter((r) => r.status === "Occupied").length,
      cleaning: rooms.filter((r) => r.status === "Cleaning").length,
      maintenance: rooms.filter((r) => r.status === "Maintenance").length,
      blocked: rooms.filter((r) => r.status === "Blocked").length,
    };
  }, [rooms, totalRooms]);

  const totalPages = Math.max(1, Math.ceil(totalRooms / parameters.pageSize));

  // Modal Triggers
  const handleOpenCreate = () => {
    setEditingRoom(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenView = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteOpen(true);
  };

  // Form Submit (Handles both Create and Update)
  const handleRoomSubmit = async (values: RoomFormValues) => {
    try {
      setActionLoading(true);

      const roomPayload: RoomPayload = {
        roomNumber: Math.floor(Number(values.roomNumber)),
        name: values.name.trim(),
        category: values.category.trim(),
        floor: Math.floor(Number(values.floor)),
        status: values.status,
        isAvailable: values.status === "Available",
        price: Number(values.price),
        capacity: Math.floor(Number(values.capacity)),
        bedCount: Math.floor(Number(values.bedCount)),
        bedType: values.bedType.trim(),
        size: Math.floor(Number(values.size)),
        description: values.description.trim(),
        amenityIds: values.amenityIds || [],
        existingImageIds: values.existingImageIds || [],
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomPayload, values.images);
        toast.success(`Room ${roomPayload.roomNumber} updated successfully.`);
      } else {
        await createRoom(roomPayload, values.images);
        toast.success(`Room ${roomPayload.roomNumber} created successfully.`);
      }

      setIsFormOpen(false);
      setEditingRoom(null);
      await loadRooms();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to save room.";
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Action
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      setActionLoading(true);
      await deleteRoom(selectedRoom.id);
      setIsDeleteOpen(false);
      setSelectedRoom(null);
      await loadRooms();
      toast.success("Room deleted successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to delete room.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Fast Status Change Action from Table
  const handleStatusChange = async (room: Room, newStatus: RoomStatus) => {
    try {
      setActionLoading(true);
      const updated = await updateRoomStatus(room.id, newStatus);
      setRooms((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(`Room ${room.roomNumber} status updated to ${newStatus}.`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to update status.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const hasActiveFilters = Boolean(
    parameters.SearchTerm ||
      parameters.Status !== "All" ||
      parameters.Category !== "All",
  );

  const handleClearFilters = () => {
    void setParameters({
      SearchTerm: null,
      Status: null,
      Category: null,
      pageNumber: 1,
    });
  };

  return (
    <div className="bg-background p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="space-y-6 mx-auto max-w-[1600px]">
        {/* Header Section */}
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="font-bold text-foreground text-2xl md:text-3xl tracking-tight">
              Rooms
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage inventory, availability, pricing, amenities and photos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-primary hover:opacity-90 shadow-sm px-4 rounded-xl h-10 font-semibold text-primary-foreground text-sm transition"
          >
            <FaPlus />
            Add Room
          </button>
        </div>

        {/* Statistics Metric Cards */}
        <RoomStats stats={statistics} />

        {/* Filters and Search Bar */}
        <RoomFilters
          searchTerm={parameters.SearchTerm}
          status={parameters.Status}
          category={parameters.Category}
          onFilterChange={(updates) => void setParameters(updates)}
        />

        {/* Room Table / Inventory List */}
        <div>
          <RoomTable
            rooms={rooms}
            totalRooms={totalRooms}
            loading={loading}
            error={error}
            actionLoading={actionLoading}
            hasFilters={hasActiveFilters}
            onRefresh={loadRooms}
            onClearFilters={handleClearFilters}
            onAddRoom={handleOpenCreate}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onStatusChange={handleStatusChange}
          />

          {!loading && !error && rooms.length > 0 && (
            <RoomPagination
              pageNumber={parameters.pageNumber}
              pageSize={parameters.pageSize}
              totalRooms={totalRooms}
              totalPages={totalPages}
              onPageChange={(page) => void setParameters({ pageNumber: page })}
            />
          )}
        </div>

        {/* Create / Edit Room Modal */}
        <CreateRoomModal
          open={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRoom(null);
          }}
          onSubmit={handleRoomSubmit}
          initialData={
            editingRoom
              ? {
                  id: editingRoom.id,
                  roomNumber: editingRoom.roomNumber,
                  name: editingRoom.name,
                  category: editingRoom.category,
                  floor: editingRoom.floor,
                  status: editingRoom.status as RoomStatus,
                  price: editingRoom.price,
                  capacity: editingRoom.capacity,
                  bedCount: editingRoom.bedCount,
                  bedType: editingRoom.bedType as (typeof BED_TYPES)[number],
                  size: editingRoom.size,
                  description: editingRoom.description,
                  amenities: editingRoom.amenities?.map((a) => a.name) || [],
                  amenityIds: editingRoom.amenities?.map((a) => a.id) || [],
                  existingImages:
                    editingRoom.images?.map((img) => ({
                      id: img.id,
                      url: img.imageUrl,
                    })) || [],
                }
              : null
          }
        />

        {/* Room Details Modal (with circular photo cycler) */}
        <RoomDetailsModal
          room={isDetailsOpen ? selectedRoom : null}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedRoom(null);
          }}
          onEdit={(room) => handleOpenEdit(room)}
        />

        {/* Delete Confirmation Modal */}
        <RoomDeleteModal
          room={isDeleteOpen ? selectedRoom : null}
          loading={actionLoading}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedRoom(null);
          }}
          onConfirm={handleDeleteRoom}
        />
      </div>
    </div>
  );
}
