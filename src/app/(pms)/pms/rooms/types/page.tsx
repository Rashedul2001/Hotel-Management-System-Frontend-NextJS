"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BedDouble,
  Layers,
  ArrowRight,
  Maximize,
  Users,
  Search,
  RotateCcw,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Building,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export interface RoomTypeData {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  defaultCapacity: number;
  imageUrl: string | null;
  createdAt: string;
  roomsCount: number;
  availableRoomsCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export default function RoomTypesPage() {
  const [types, setTypes] = useState<RoomTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomTypeData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    basePrice: 12000,
    defaultCapacity: 2,
    description: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [confirmDeleteType, setConfirmDeleteType] = useState<RoomTypeData | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/room-types");
      if (!res.ok) {
        throw new Error("Unable to fetch room types from server.");
      }
      const data = await res.json();
      setTypes(data);
    } catch (err: any) {
      errorToast("Error", err.message || "Failed to load room types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      name: "",
      basePrice: 15000,
      defaultCapacity: 2,
      description: "",
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: RoomTypeData) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      basePrice: type.basePrice,
      defaultCapacity: type.defaultCapacity,
      description: type.description || "",
      imageUrl: type.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      errorToast("Validation", "Room type name is required.");
      return;
    }
    if (formData.basePrice < 100) {
      errorToast("Validation", "Base price must be at least ৳100.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        basePrice: Math.round(Number(formData.basePrice)),
        defaultCapacity: Math.round(Number(formData.defaultCapacity)),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
      };

      if (editingType) {
        // PUT update
        const res = await apiFetch(`/api/room-types/${editingType.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to update room type.");
        }
        successToast("Room Type Updated", `Category "${payload.name}" updated successfully.`);
      } else {
        // POST create
        const res = await apiFetch("/api/room-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to create room type.");
        }
        successToast("Room Type Created", `Category "${payload.name}" is now available.`);
      }

      setIsModalOpen(false);
      setEditingType(null);
      await loadData();
    } catch (err: any) {
      errorToast("Save Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteType) return;

    try {
      setDeletingId(confirmDeleteType.id);
      const res = await apiFetch(`/api/room-types/${confirmDeleteType.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Cannot delete room type.");
      }

      successToast("Room Type Deleted", `Category "${confirmDeleteType.name}" removed.`);
      setConfirmDeleteType(null);
      await loadData();
    } catch (err: any) {
      errorToast("Delete Error", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = types.filter((t) =>
    t.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Layers className="size-4" />
            Rooms & Rates Configuration
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Room Types & Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure room classifications, tier base pricing, occupancy standards, and monitor inventory distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="size-4" />
            Add Room Type
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Defined Categories</span>
          <p className="mt-1 text-2xl font-bold text-foreground">{types.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active room tiers</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Total Physical Rooms</span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {types.reduce((sum, t) => sum + t.roomsCount, 0)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to categories</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Available Rooms</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {types.reduce((sum, t) => sum + t.availableRoomsCount, 0)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ready for guest booking</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Average Base Price</span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {types.length
              ? formatCurrency(
                  Math.round(types.reduce((sum, t) => sum + t.basePrice, 0) / types.length)
                )
              : "৳0"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Property benchmark rate</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter room types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Room Types Cards */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-3xl border border-border bg-card p-6 animate-pulse space-y-4"
            >
              <div className="h-6 w-1/3 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-20 w-full bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3">
          <Layers className="size-10 mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground">No Room Types Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? "No room categories match your filter term." : "Create your first room type category to organize hotel inventory."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-3.5" />
            Add Room Type
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((type) => (
            <div
              key={type.id}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md hover:border-primary/30 group"
            >
              <div>
                {/* Category Header & Action Buttons */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BedDouble className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {type.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        Standard tier
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(type)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                      title="Edit Room Type"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteType(type)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                      title="Delete Room Type"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {type.description || "No specific tier description provided."}
                </p>

                {/* Rates & Capacity Grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-muted/30 p-3.5 border border-border/60 text-xs">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Base Rate
                    </span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(type.basePrice)}
                    </span>
                    <span className="text-[10px] text-muted-foreground"> / night</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Avg Rate
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(type.avgPrice)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Capacity
                    </span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <Users className="size-3 text-muted-foreground" />
                      {type.defaultCapacity} Guests
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Inventory
                    </span>
                    <span className="font-medium text-foreground">
                      {type.availableRoomsCount} / {type.roomsCount} avail
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/pms/rooms?category=${encodeURIComponent(type.name)}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  Manage {type.roomsCount} Rooms
                  <ArrowRight className="size-3" />
                </Link>

                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: #{type.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingType ? `Edit Room Type: ${editingType.name}` : "Create New Room Type"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingType
                    ? "Updating this name will automatically update category on all assigned rooms."
                    : "Add a new room classification tier to your hotel system."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Type / Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe, Penthouse, Beachfront Villa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Base Price (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    step="100"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Default Capacity (Guests) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.defaultCapacity}
                    onChange={(e) => setFormData({ ...formData, defaultCapacity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Tier Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the atmosphere, features, and luxury standards of this tier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Reference Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="size-3.5 animate-spin" />}
                  {editingType ? "Save Changes" : "Create Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteType}
        title="Delete Room Type"
        description="Are you sure you want to delete this room type category? If rooms are currently assigned to this category, please reassign them first."
        itemName={confirmDeleteType?.name}
        confirmText="Delete Room Type"
        isLoading={deletingId === confirmDeleteType?.id}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteType(null)}
      />
    </div>
  );
}
