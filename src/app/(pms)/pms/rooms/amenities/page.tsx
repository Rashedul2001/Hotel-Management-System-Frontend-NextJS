"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Pen,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { apiFetch } from "@/lib/api";
import type { RoomAmenity } from "@/types/room";

export default function RoomAmenitiesPage() {
  const [amenities, setAmenities] = useState<RoomAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<RoomAmenity | null>(null);
  const [confirmDeleteAmenity, setConfirmDeleteAmenity] = useState<RoomAmenity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/amenities");
      if (!res.ok) throw new Error("Failed to load amenities.");
      const data = await res.json();
      setAmenities(data);
    } catch (err: any) {
      errorToast("Error", err.message || "Could not load amenities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  const handleOpenCreate = () => {
    setEditingAmenity(null);
    setNameInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (amenity: RoomAmenity) => {
    setEditingAmenity(amenity);
    setNameInput(amenity.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      errorToast("Validation", "Amenity name cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingAmenity) {
        const res = await apiFetch(`/api/amenities/${editingAmenity.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to update amenity.");
        }
        successToast("Amenity Updated", `Amenity "${trimmed}" updated successfully.`);
      } else {
        const res = await apiFetch("/api/amenities", {
          method: "POST",
          body: JSON.stringify({ name: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create amenity.");
        }
        successToast("Amenity Created", `Amenity "${trimmed}" created successfully.`);
      }

      setIsModalOpen(false);
      setNameInput("");
      setEditingAmenity(null);
      await loadAmenities();
    } catch (err: any) {
      errorToast("Save Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (amenity: RoomAmenity) => {
    setConfirmDeleteAmenity(amenity);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteAmenity) return;

    try {
      setDeletingId(confirmDeleteAmenity.id);
      const res = await apiFetch(`/api/amenities/${confirmDeleteAmenity.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Cannot delete amenity (it may be linked to active rooms).");
      }

      successToast("Amenity Deleted", `Amenity "${confirmDeleteAmenity.name}" removed.`);
      setConfirmDeleteAmenity(null);
      await loadAmenities();
    } catch (err: any) {
      errorToast("Delete Error", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = amenities.filter((a) =>
    a.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-4" />
            Rooms & Rates Settings
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Room Amenities Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure, add, update, and manage property-wide room features and guest room amenities.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Add New Amenity
        </button>
      </div>

      {/* Search and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search amenities (e.g., Ocean View, High-Speed WiFi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {filtered.length} amenity item{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={loadAmenities}
            title="Refresh amenities"
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Amenities */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
          <p>No amenities found matching your search.</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="size-3.5" />
            Create this amenity now
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((amenity) => (
            <div
              key={amenity.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {amenity.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ID #{amenity.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(amenity)}
                  title="Rename Amenity"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <Pen className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === amenity.id}
                  onClick={() => handleDelete(amenity)}
                  title="Delete Amenity"
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                >
                  {deletingId === amenity.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              {editingAmenity ? "Edit Amenity Name" : "Create New Amenity"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Enter the title of the amenity as it will be seen by guests and staff.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Amenity Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Nespresso Coffee Machine, Jacuzzi"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="size-3.5 animate-spin" />}
                  {editingAmenity ? "Update Amenity" : "Save Amenity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation for Amenity Deletion */}
      <ConfirmModal
        isOpen={!!confirmDeleteAmenity}
        title="Delete Amenity"
        description="Are you sure you want to permanently delete this amenity? If it is currently assigned to existing rooms, please remove it from those rooms first."
        itemName={confirmDeleteAmenity?.name}
        confirmText="Delete Amenity"
        isLoading={deletingId === confirmDeleteAmenity?.id}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteAmenity(null)}
      />
    </div>
  );
}
