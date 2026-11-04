"use client";

//****************************************/


//****************************************/

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import {
  FaBed,
  FaBroom,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCircleExclamation,
  FaDoorClosed,
  FaEllipsisVertical,
  FaEye,
  FaFilter,
  FaGear,
  FaMagnifyingGlass,
  FaPen,
  FaPlus,
  FaRotate,
  FaTrash,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";

import {
  createAdminRoom,
  deleteAdminRoom,
  getAdminRooms,
  updateAdminRoom,
  updateAdminRoomStatus,
} from "@/lib/admin-rooms-api";

import type { Room, RoomStatus } from "@/types/room";
import { toast } from "sonner";

import CreateRoomModal, {
  type RoomFormValues,
} from "@/components/admin/rooms/create-room-modal";
import Image from "next/image";

const PAGE_SIZE = 7;

const roomCategories: string[] = [
  "All",
  "Standard",
  "Deluxe",
  "Suite",
  "Executive",
  "Family",
] as const;

const statuses: Array<RoomStatus | "All"> = [
  "All",
  "Available",
  "Occupied",
  "Cleaning",
  "Maintenance",
  "Blocked",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function imageUrl(room: Room) {
  return room.images[0]?.imageUrl;
}

function amenityNames(room: Room) {
  return room.amenities.map((amenity) => amenity.name);
}

function statusClasses(status: string) {
  switch (status) {
    case "Available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "Occupied":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "Cleaning":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "Maintenance":
      return "bg-orange-50 text-orange-700 border-orange-200";

    case "Blocked":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "Available":
      return <FaCheck />;

    case "Occupied":
      return <FaUsers />;

    case "Cleaning":
      return <FaBroom />;

    case "Maintenance":
      return <FaGear />;

    case "Blocked":
      return <FaCircleExclamation />;

    default:
      return null;
  }
}

export default function RoomsPageClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

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

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAdminRooms({
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load rooms.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    parameters.Category,
    parameters.SearchTerm,
    parameters.Status,
    parameters.pageNumber,
    parameters.pageSize,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, [loadRooms]);

  const updateSearch = useDebouncedCallback(() => {
    setParameters({ SearchTerm: searchInput || null, pageNumber: 1 });
  }, 300);
  const searchRooms = (value: string) => {
    setSearchInput(value);
    updateSearch();
  };

  const statistics = useMemo(() => {
    return {
      total: totalRooms,
      available: rooms.filter((room) => room.status === "Available").length,
      occupied: rooms.filter((room) => room.status === "Occupied").length,
      cleaning: rooms.filter((room) => room.status === "Cleaning").length,
      maintenance: rooms.filter((room) => room.status === "Maintenance").length,
      blocked: rooms.filter((room) => room.status === "Blocked").length,
    };
  }, [rooms, totalRooms]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalRooms / parameters.pageSize),
  );

  const openCreateForm = () => {
    setEditingRoom(null);
    setShowForm(true);
  }

  function openEditForm(room: Room) {
    setEditingRoom(room);
    setShowForm(true);
  }

  function openDetails(room: Room) {
    setSelectedRoom(room);
    setShowDetails(true);
  }

  function openDelete(room: Room) {
    setSelectedRoom(room);
    setShowDelete(true);
  }

  async function handleRoomSubmit(values: RoomFormValues) {
    try {
      setActionLoading(true);
      const roomInput = {
        roomNumber: values.roomNumber.trim(),
        name: values.name.trim(),
        category: values.category,
        floor: values.floor,
        status: values.status,
        price: values.price,
        capacity: values.capacity,
        bedCount: values.bedCount,
        bedType: values.bedType,
        size: values.size,
        description: values.description.trim(),
        amenityIds: values.amenityIds,
      };

      if (editingRoom) {
        await updateAdminRoom(editingRoom.id, roomInput, values.images);
      } else {
        await createAdminRoom(roomInput, values.images);
      }

      setShowForm(false);
      await loadRooms();
      toast.success(editingRoom ? "Room updated." : "Room created.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save the room.";
      toast.error(message);
      throw error;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedRoom) return;

    try {
      setActionLoading(true);

      await deleteAdminRoom(selectedRoom.id);

      setShowDelete(false);
      setSelectedRoom(null);

      await loadRooms();
      toast.success("Room deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete room.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(room: Room, newStatus: RoomStatus) {
    try {
      setActionLoading(true);
      setShowStatusMenu(null);

      const updated = await updateAdminRoomStatus(room.id, newStatus);

      setRooms((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Room status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update room status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (

    <div className="bg-background p-4 md:p-6 lg:p-8 min-h-screen">
      <div className="space-y-6 mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="font-bold text-foreground text-2xl md:text-3xl tracking-tight">
              Rooms
            </h1>

            <p className="mt-1 text-muted-foreground text-sm">
              Manage rooms, availability, pricing and housekeeping status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* currently no need for refresh like this make it automatic  */}
            {/* <button
              type="button"
              onClick={loadRooms}
              className="inline-flex items-center gap-2 bg-card hover:bg-accent px-4 border border-border rounded-xl h-10 font-medium text-foreground text-sm transition"
            >
              <FaRotate className={loading ? "animate-spin" : ""} />
              Refresh
            </button> */}

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 bg-primary hover:opacity-90 shadow-sm px-4 rounded-xl h-10 font-semibold text-primary-foreground text-sm transition"
            >
              <FaPlus />
              Add Room
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="gap-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Total Rooms"
            value={statistics.total}
            icon={<FaDoorClosed />}
          />

          <StatCard
            title="Available"
            value={statistics.available}
            icon={<FaCheck />}
            iconClass="text-emerald-600"
          />

          <StatCard
            title="Occupied"
            value={statistics.occupied}
            icon={<FaUsers />}
            iconClass="text-blue-600"
          />

          <StatCard
            title="Cleaning"
            value={statistics.cleaning}
            icon={<FaBroom />}
            iconClass="text-amber-600"
          />

          <StatCard
            title="Maintenance"
            value={statistics.maintenance}
            icon={<FaGear />}
            iconClass="text-orange-600"
          />

          <StatCard
            title="Blocked"
            value={statistics.blocked}
            icon={<FaCircleExclamation />}
            iconClass="text-red-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-card shadow-sm p-4 border border-border rounded-2xl">
          <div className="flex xl:flex-row flex-col xl:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <FaMagnifyingGlass className="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none" />

              <input
                value={searchInput}
                onChange={(event) => searchRooms(event.target.value)}
                placeholder="Search room number, room name or description..."
                className="bg-background pr-4 pl-10 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full h-11 text-foreground placeholder:text-muted-foreground text-sm transition"
              />
            </div>

            <div className="flex sm:flex-row flex-col gap-3">
              <div className="relative">
                <FaFilter className="top-1/2 left-3 absolute text-muted-foreground text-xs -translate-y-1/2 pointer-events-none" />

                <select
                  value={parameters.Status}
                  onChange={(event) =>
                    setParameters({
                      Status: event.target.value,
                      pageNumber: 1,
                    })
                  }
                  className="bg-background pr-8 pl-9 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full min-w-[180px] h-11 text-foreground text-sm appearance-none"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All statuses" : item}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={parameters.Category}
                onChange={(event) =>
                  setParameters({
                    Category: event.target.value,
                    pageNumber: 1,
                  })
                }
                className="bg-background px-4 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-w-[170px] h-11 text-foreground text-sm"
              >
                {roomCategories.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All room categories" : item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Room table */}
        <div className="bg-card shadow-sm border border-border rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center px-4 md:px-6 py-4 border-border border-b">
            <div>
              <h2 className="font-semibold text-foreground">Room Inventory</h2>

              <p className="mt-1 text-muted-foreground text-xs">
                {totalRooms} room
                {totalRooms !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs">
              <FaBed />
              Live room inventory
            </div>
          </div>

          {error && !loading ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <FaCircleExclamation className="text-red-500 text-3xl" />
              <h3 className="mt-4 font-semibold text-foreground">
                Unable to load rooms
              </h3>
              <p className="mt-1 max-w-md text-muted-foreground text-sm">
                {error}
              </p>
              <button
                type="button"
                onClick={loadRooms}
                className="inline-flex items-center gap-2 bg-primary hover:opacity-90 mt-5 px-4 rounded-lg h-9 font-semibold text-primary-foreground text-xs"
              >
                <FaRotate />
                Try again
              </button>
            </div>
          ) : loading ? (
            <LoadingState />
          ) : rooms.length === 0 ? (
            <EmptyState
              search={
                Boolean(
                  parameters.SearchTerm ||
                  parameters.Status !== "All" ||
                  parameters.Category !== "All",
                )
              }
              onClear={() => {
                updateSearch.cancel();
                setSearchInput("");
                setParameters({
                  SearchTerm: null,
                  Status: null,
                  Category: null,
                  pageNumber: 1,
                });
              }}
              onAdd={openCreateForm}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-262.5">
                  <thead>
                    <tr className="bg-muted/40 border-border border-b text-muted-foreground text-xs text-left uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Room</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Floor</th>
                      <th className="px-6 py-4 font-semibold">Capacity</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {rooms.map((room) => (
                      <RoomRow
                        key={room.id}
                        room={room}
                        statusMenuOpen={showStatusMenu === room.id}
                        actionLoading={actionLoading}
                        onView={() => openDetails(room)}
                        onEdit={() => openEditForm(room)}
                        onDelete={() => openDelete(room)}
                        onToggleStatusMenu={() =>
                          setShowStatusMenu(
                            showStatusMenu === room.id ? null : room.id,
                          )
                        }
                        onStatusChange={(newStatus) =>
                          handleStatusChange(room, newStatus)
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border">
                {rooms.map((room) => (
                  <MobileRoomCard
                    key={room.id}
                    room={room}
                    onView={() => openDetails(room)}
                    onEdit={() => openEditForm(room)}
                    onDelete={() => openDelete(room)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 px-4 md:px-6 py-4 border-border border-t">
                <p className="text-muted-foreground text-xs">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {totalRooms === 0
                      ? 0
                      : (parameters.pageNumber - 1) * parameters.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(
                      parameters.pageNumber * parameters.pageSize,
                      totalRooms,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalRooms}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={parameters.pageNumber <= 1}
                    onClick={() =>
                      setParameters({
                        pageNumber: Math.max(1, parameters.pageNumber - 1),
                      })
                    }
                    className="inline-flex items-center gap-2 hover:bg-accent disabled:opacity-40 px-3 border border-border rounded-lg h-9 text-foreground text-sm transition disabled:cursor-not-allowed"
                  >
                    <FaChevronLeft />
                    Previous
                  </button>

                  <span className="hidden sm:inline text-muted-foreground text-sm">
                    Page {parameters.pageNumber} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={parameters.pageNumber >= totalPages}
                    onClick={() =>
                      setParameters({
                        pageNumber: Math.min(
                          totalPages,
                          parameters.pageNumber + 1,
                        ),
                      })
                    }
                    className="inline-flex items-center gap-2 hover:bg-accent disabled:opacity-40 px-3 border border-border rounded-lg h-9 text-foreground text-sm transition disabled:cursor-not-allowed"
                  >
                    Next
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form modal */}
        <CreateRoomModal
          open={showForm}
          onClose={() => setShowForm(false)}
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
                bedType: editingRoom.bedType as RoomFormValues["bedType"],
                size: editingRoom.size,
                description: editingRoom.description,
                amenities: amenityNames(editingRoom),
                amenityIds: editingRoom.amenities.map((amenity) => amenity.id),
                images: editingRoom.images.map((image) => image.imageUrl),
              }
              : null
          }
          title={editingRoom ? "Edit Room" : "Create New Room"}
          submitLabel={editingRoom ? "Save Changes" : "Create Room"}
        />

        {/* Details modal */}
        {showDetails && selectedRoom && (
          <RoomDetailsModal
            room={selectedRoom}
            onClose={() => {
              setShowDetails(false);
              setSelectedRoom(null);
            }}
            onEdit={() => {
              setShowDetails(false);
              openEditForm(selectedRoom);
            }}
          />
        )}

        {/* Delete modal */}
        {showDelete && selectedRoom && (
          <DeleteModal
            room={selectedRoom}
            loading={actionLoading}
            onClose={() => {
              setShowDelete(false);
              setSelectedRoom(null);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  icon,
  iconClass = "text-primary",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="bg-card shadow-sm p-4 border border-border rounded-2xl">
      <div className="flex justify-between items-center gap-2">
        <p className="font-medium text-muted-foreground text-xs">{title}</p>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${iconClass}`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 font-bold text-foreground text-2xl tracking-tight">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop row                                                                */
/* -------------------------------------------------------------------------- */

function RoomRow({
  room,
  statusMenuOpen,
  actionLoading,
  onView,
  onEdit,
  onDelete,
  onToggleStatusMenu,
  onStatusChange,
}: {
  room: Room;
  statusMenuOpen: boolean;
  actionLoading: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatusMenu: () => void;
  onStatusChange: (status: RoomStatus) => void;
}) {
  return (
    <tr className="group hover:bg-muted/30 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-muted rounded-xl w-11 h-11 overflow-hidden shrink-0">
            {imageUrl(room) ? (
              <Image
                src={imageUrl(room)}
                alt={room.name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaBed className="text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              onClick={onView}
              className="font-semibold text-foreground hover:text-primary text-sm text-left truncate"
            >
              Room {room.roomNumber}
            </button>

            <p className="max-w-[230px] text-muted-foreground text-xs truncate">
              {room.name}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="bg-muted px-2.5 py-1 rounded-lg font-medium text-foreground text-xs">
          {room.category}
        </span>
      </td>

      <td className="px-6 py-4 text-muted-foreground text-sm">
        Floor {room.floor}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-foreground text-sm">
          <FaUsers className="text-muted-foreground text-xs" />
          {room.capacity} guests
        </div>

        <p className="mt-1 text-muted-foreground text-xs">
          {room.bedCount} × {room.bedType}
        </p>
      </td>

      <td className="px-6 py-4">
        <p className="font-semibold text-foreground text-sm">
          {formatCurrency(room.price)}
        </p>

        <p className="text-muted-foreground text-xs">per night</p>
      </td>

      <td className="px-6 py-4">
        <div className="relative">
          <button
            type="button"
            disabled={actionLoading}
            onClick={onToggleStatusMenu}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
              room.status,
            )}`}
          >
            {statusIcon(room.status)}
            {room.status}
          </button>

          {statusMenuOpen && (
            <div className="top-full left-0 z-30 absolute bg-card shadow-xl mt-2 p-1.5 border border-border rounded-xl w-44">
              {statuses
                .filter((item): item is RoomStatus => item !== "All")
                .map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onStatusChange(item)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-accent ${item === room.status ? "font-semibold" : ""
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${item === "Available"
                        ? "bg-emerald-500"
                        : item === "Occupied"
                          ? "bg-blue-500"
                          : item === "Cleaning"
                            ? "bg-amber-500"
                            : item === "Maintenance"
                              ? "bg-orange-500"
                              : "bg-red-500"
                        }`}
                    />

                    {item}
                  </button>
                ))}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <ActionButton label="View" onClick={onView}>
            <FaEye />
          </ActionButton>

          <ActionButton label="Edit" onClick={onEdit}>
            <FaPen />
          </ActionButton>

          <ActionButton label="Delete" danger onClick={onDelete}>
            <FaTrash />
          </ActionButton>

          <button
            type="button"
            className="flex justify-center items-center hover:bg-accent ml-1 rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground transition"
            aria-label="More actions"
          >
            <FaEllipsisVertical />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition ${danger
        ? "text-red-500 hover:bg-red-50"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile card                                                                */
/* -------------------------------------------------------------------------- */

function MobileRoomCard({
  room,
  onView,
  onEdit,
  onDelete,
}: {
  room: Room;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4">
      <div className="flex gap-3">
        <div className="bg-muted rounded-xl w-20 h-20 overflow-hidden shrink-0">
          {imageUrl(room) ? (
            <Image
              src={imageUrl(room)}
              alt={room.name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
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
                onClick={onView}
                className="font-semibold text-foreground text-sm text-left"
              >
                Room {room.roomNumber}
              </button>

              <p className="mt-0.5 text-muted-foreground text-xs truncate">
                {room.name}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusClasses(
                room.status,
              )}`}
            >
              {room.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-muted-foreground text-xs">
            <span>            {room.category}</span>
            <span>Floor {room.floor}</span>
            <span>{room.capacity} guests</span>
            <span>            {formatCurrency(room.price)}/night</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onView}
          className="flex flex-1 justify-center items-center gap-2 hover:bg-accent border border-border rounded-lg h-9 font-medium text-foreground text-xs"
        >
          <FaEye />
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="flex flex-1 justify-center items-center gap-2 hover:bg-accent border border-border rounded-lg h-9 font-medium text-foreground text-xs"
        >
          <FaPen />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex justify-center items-center hover:bg-red-50 border border-red-200 rounded-lg w-10 h-9 text-red-500"
          aria-label="Delete room"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* Details modal                                                              */
/* -------------------------------------------------------------------------- */

function RoomDetailsModal({
  room,
  onClose,
  onEdit,
}: {
  room: Room;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-card shadow-2xl border border-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="relative bg-muted h-56 sm:h-72 overflow-hidden">
          {imageUrl(room) ? (
            <Image
              src={imageUrl(room)}
              alt={room.name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <FaBed className="text-muted-foreground text-5xl" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="top-4 right-4 absolute flex justify-center items-center bg-black/30 hover:bg-black/50 backdrop-blur rounded-full w-9 h-9 text-white transition"
          >
            <FaXmark />
          </button>

          <div className="right-5 bottom-5 left-5 absolute text-white">
            <span className="inline-flex bg-white/15 backdrop-blur px-3 py-1 rounded-full font-semibold text-xs">
              Room {room.roomNumber}
            </span>

            <h2 className="mt-2 font-bold text-2xl">{room.name}</h2>

            <p className="mt-1 text-white/80 text-sm">
              {room.category} · Floor {room.floor}
            </p>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="gap-3 grid grid-cols-2 md:grid-cols-4">
            <InfoBox label="Status" value={room.status} />

            <InfoBox
              label="Price"
              value={`${formatCurrency(room.price)}/night`}
            />

            <InfoBox label="Capacity" value={`${room.capacity} guests`} />

            <InfoBox label="Size" value={`${room.size} m²`} />
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground text-sm">
              Description
            </h3>

            <p className="mt-2 text-muted-foreground text-sm leading-6">
              {room.description ||
                "No description has been added for this room."}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground text-sm">
              Bed Configuration
            </h3>

            <p className="mt-2 text-muted-foreground text-sm">
              {room.bedCount} × {room.bedType} bed
              {room.bedCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground text-sm">Amenities</h3>

            <div className="flex flex-wrap gap-2 mt-3">
              {room.amenities.length > 0 ? (
                room.amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className="bg-muted px-3 py-1.5 rounded-full text-foreground text-xs"
                  >
                    {amenity.name}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No amenities added.
                </p>
              )}
            </div>
          </div>

          <div className="gap-3 grid sm:grid-cols-2 mt-6 pt-5 border-border border-t text-muted-foreground text-xs">
            <p>
              Created:{" "}
              <span className="font-medium text-foreground">
                {formatDate(room.createdAt)}
              </span>
            </p>

            <p className="sm:text-right">
              Updated:{" "}
              <span className="font-medium text-foreground">
                {formatDate(room.UpdatedAt)}
              </span>
            </p>
          </div>

          <div className="flex sm:flex-row flex-col-reverse sm:justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-accent px-5 border border-border rounded-xl h-10 font-medium text-foreground text-sm"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex justify-center items-center gap-2 bg-primary hover:opacity-90 px-5 rounded-xl h-10 font-semibold text-primary-foreground text-sm"
            >
              <FaPen />
              Edit Room
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete modal                                                               */
/* -------------------------------------------------------------------------- */

function DeleteModal({
  room,
  loading,
  onClose,
  onDelete,
}: {
  room: Room;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-card shadow-2xl p-6 border border-border rounded-2xl w-full max-w-md">
        <div className="flex justify-center items-center bg-red-50 rounded-xl w-12 h-12 text-red-600">
          <FaTrash />
        </div>

        <h2 className="mt-5 font-bold text-foreground text-lg">Delete Room?</h2>

        <p className="mt-2 text-muted-foreground text-sm leading-6">
          You are about to delete{" "}
          <span className="font-semibold text-foreground">
            Room {room.roomNumber}
          </span>
          . This action cannot be undone.
        </p>

        <div className="flex sm:flex-row flex-col-reverse sm:justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-accent px-5 border border-border rounded-xl h-10 font-medium text-foreground text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="inline-flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 px-5 rounded-xl h-10 font-semibold text-white text-sm"
          >
            {loading && (
              <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
            )}
            Delete Room
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared modal                                                               */
/* -------------------------------------------------------------------------- */

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-3 md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 p-3 border border-border rounded-xl">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>

      <p className="mt-1 font-semibold text-foreground text-sm">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-muted rounded-xl h-16 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({
  search,
  onClear,
  onAdd,
}: {
  search: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col justify-center items-center px-6 py-16 text-center">
      <div className="flex justify-center items-center bg-muted rounded-2xl w-14 h-14 text-muted-foreground">
        <FaBed />
      </div>

      <h3 className="mt-4 font-semibold text-foreground">No rooms found</h3>

      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        {search
          ? "Try changing your search or filters."
          : "Your hotel does not have any rooms yet."}
      </p>

      <div className="flex gap-2 mt-5">
        {search && (
          <button
            type="button"
            onClick={onClear}
            className="hover:bg-accent px-4 border border-border rounded-lg h-9 font-medium text-xs"
          >
            Clear filters
          </button>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-primary hover:opacity-90 px-4 rounded-lg h-9 font-semibold text-primary-foreground text-xs"
        >
          <FaPlus />
          Add Room
        </button>
      </div>
    </div>
  );
}
