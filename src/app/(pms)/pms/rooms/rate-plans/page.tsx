"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Tag,
  Plus,
  Search,
  Pen,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  UploadCloud,
  BedDouble,
  Calendar,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  type OfferItem,
} from "@/lib/settings-api";
import { apiFetch } from "@/lib/api";
import type { Room } from "@/types/room";

export default function RatePlansAndOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(20);
  const [targetType, setTargetType] = useState<"category" | "room">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("Deluxe");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [durationDays, setDurationDays] = useState<number>(30);
  const [validUntilDate, setValidUntilDate] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [confirmDeleteOffer, setConfirmDeleteOffer] = useState<OfferItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await getAllOffers();
      setOffers(data);
    } catch (err: any) {
      errorToast("Error", err.message || "Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [roomsRes, catsRes] = await Promise.all([
        apiFetch("/api/rooms?pageSize=100"),
        apiFetch("/api/rooms/categories"),
      ]);
      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setRooms(Array.isArray(rData) ? rData : rData.rooms || []);
      }
      if (catsRes.ok) {
        const cData = await catsRes.json();
        if (Array.isArray(cData)) setCategories(cData);
      }
    } catch {
      // Ignore reference load errors
    }
  };

  useEffect(() => {
    loadOffers();
    loadReferenceData();
  }, []);

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setTitle("");
    setDescription("");
    setDiscountPercentage(20);
    setTargetType("category");
    setSelectedCategory(categories[0] || "Deluxe");
    setSelectedRoomId(rooms[0]?.id || "");
    setDurationDays(30);
    const future = new Date();
    future.setDate(future.getDate() + 30);
    setValidUntilDate(future.toISOString().split("T")[0]);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setManualImageUrl("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: OfferItem) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDiscountPercentage(offer.discountPercentage ?? 20);
    if (offer.roomId) {
      setTargetType("room");
      setSelectedRoomId(offer.roomId);
    } else {
      setTargetType("category");
      setSelectedCategory(offer.category || categories[0] || "Deluxe");
    }
    if (offer.validUntil) {
      const dateStr = new Date(offer.validUntil).toISOString().split("T")[0];
      setValidUntilDate(dateStr);
    } else {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      setValidUntilDate(future.toISOString().split("T")[0]);
    }
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(offer.imageUrl || null);
    setManualImageUrl(offer.imageUrl || "");
    setIsActive(offer.isActive);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      errorToast("Invalid Format", "Allowed image formats: JPEG, PNG, WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      errorToast("File Too Large", "Max image size is 10 MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      errorToast("Validation", "Offer title is required.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("discountPercentage", String(discountPercentage));
      formData.append("isActive", String(isActive));

      if (targetType === "room" && selectedRoomId) {
        formData.append("roomId", selectedRoomId);
      } else if (targetType === "category" && selectedCategory) {
        formData.append("category", selectedCategory);
      }

      if (validUntilDate) {
        formData.append("validUntil", new Date(validUntilDate).toISOString());
      }

      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      } else if (manualImageUrl.trim()) {
        formData.append("imageUrl", manualImageUrl.trim());
      }

      if (editingOffer) {
        await updateOffer(editingOffer.id, formData);
        successToast("Offer Updated", `"${title}" updated successfully.`);
      } else {
        await createOffer(formData);
        successToast("Offer Created", `"${title}" is now active with reduced pricing.`);
      }

      setIsModalOpen(false);
      setEditingOffer(null);
      await loadOffers();
    } catch (err: any) {
      errorToast("Save Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (offer: OfferItem) => {
    try {
      setTogglingId(offer.id);
      await toggleOfferStatus(offer.id, !offer.isActive);
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      );
      successToast("Status Updated", `Offer marked as ${!offer.isActive ? "Active" : "Inactive"}.`);
    } catch (err: any) {
      errorToast("Error", err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!confirmDeleteOffer) return;

    try {
      setDeletingId(confirmDeleteOffer.id);
      await deleteOffer(confirmDeleteOffer.id);
      successToast("Offer Deleted", `"${confirmDeleteOffer.title}" permanently removed.`);
      setConfirmDeleteOffer(null);
      await loadOffers();
    } catch (err: any) {
      errorToast("Delete Error", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      (o.category && o.category.toLowerCase().includes(search.trim().toLowerCase())) ||
      (o.roomName && o.roomName.toLowerCase().includes(search.trim().toLowerCase()))
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Tag className="size-4" />
            Rate Plans & Special Offers
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Promotional Offers & Price Reductions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure room or category rate discounts with defined expiration durations. Expired offers are automatically purged from the booking portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadOffers}
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
            Create Offer
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Total Active Offers</span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {offers.filter((o) => o.isActive).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Live on booking portal</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Category Tier Offers</span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {offers.filter((o) => !!o.category).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Applicable to room tiers</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Specific Room Offers</span>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {offers.filter((o) => !!o.roomId).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to individual rooms</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Average Discount</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {offers.length
              ? Math.round(
                  offers.reduce((acc, o) => acc + (o.discountPercentage || 0), 0) /
                    offers.length
                )
              : 0}
            %
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across active promotions</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter offers by title, category, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Offers Cards Grid */}
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
          <Tag className="size-10 mx-auto text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground">No Offers Configured</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create a room or category discount offer to reward guests and accelerate booking conversions.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-3.5" />
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((offer) => {
            const isTargetRoom = !!offer.roomId;
            const targetText = isTargetRoom
              ? `Room: ${offer.roomName || "Specific Room"}`
              : `Tier: ${offer.category || "All Categories"}`;

            return (
              <div
                key={offer.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md hover:border-primary/40 group overflow-hidden"
              >
                <div>
                  {/* Photo Preview & Discount Tag */}
                  <div className="relative aspect-[1.8] w-full rounded-2xl overflow-hidden mb-4 bg-muted">
                    <Image
                      src={offer.imageUrl || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"}
                      alt={offer.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                        {offer.discount}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                      <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur">
                        <BedDouble className="size-3 text-amber-300" />
                        {targetText}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur ${
                          offer.isActive ? "bg-emerald-500/80 text-white" : "bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        {offer.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-foreground line-clamp-1">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Validity Duration Note */}
                  <div className="mt-4 rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground border border-border/60 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-primary" />
                      {offer.validUntil ? (
                        <>Expires: {new Date(offer.validUntil).toLocaleDateString()}</>
                      ) : (
                        <>Ongoing Promotion</>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">Auto-deletes on expiry</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(offer)}
                    disabled={togglingId === offer.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {offer.isActive ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5 text-muted-foreground" />
                        Disabled
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(offer)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                      title="Edit Offer"
                    >
                      <Pen className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOffer(offer)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {editingOffer ? "Edit Promotional Offer" : "Create New Promotional Offer"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Set target room or category, discount percentage, and duration.
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
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Romantic Getaway Escape, Summer Deluxe Special"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Target Type Switcher: Room vs Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Offer Target *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setTargetType("category")}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      targetType === "category"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Entire Room Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType("room")}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      targetType === "room"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Specific Room
                  </button>
                </div>

                {targetType === "category" ? (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c} Tier Rooms
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category} - Room #{r.roomNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Discount Percentage & Expiration Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">e.g. 20 for 20% OFF</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Valid Until (Duration) *
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntilDate}
                    onChange={(e) => setValidUntilDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">Auto-deletes on expiry</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description / Inclusions
                </label>
                <textarea
                  rows={2}
                  placeholder="Includes artisanal breakfast, welcome drinks, late checkout..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Offer Image (Upload or URL)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    <UploadCloud className="size-3.5" />
                    Upload Image
                  </button>

                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={manualImageUrl}
                    onChange={(e) => {
                      setManualImageUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {previewUrl && (
                  <div className="mt-3 relative h-28 w-full rounded-xl overflow-hidden border border-border">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-xs text-foreground font-medium cursor-pointer">
                  Activate this offer immediately on guest portal
                </label>
              </div>

              {/* Actions */}
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
                  {editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteOffer}
        title="Delete Promotional Offer"
        description="Are you sure you want to permanently delete this offer? Any live bookings made with this offer will retain their agreed price, but the offer will no longer be visible or claimable."
        itemName={confirmDeleteOffer?.title}
        confirmText="Delete Offer"
        isLoading={deletingId === confirmDeleteOffer?.id}
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteOffer(null)}
      />
    </div>
  );
}
