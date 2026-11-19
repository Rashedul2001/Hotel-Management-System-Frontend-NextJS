"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  TrendingUp,
  Search,
  Filter,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { getRooms, updateRoomPrice } from "@/lib/admin-rooms-api";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

export default function RoomPricingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Inline editing state: { [roomId]: priceString }
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Bulk adjustment state
  const [bulkCategory, setBulkCategory] = useState("Deluxe");
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<"percent" | "fixed">("percent");
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [bulkApplying, setBulkApplying] = useState(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms({ pageSize: 100 });
      setRooms(data.rooms);
    } catch (err: any) {
      errorToast("Error", err.message || "Failed to load room pricing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const categories = ["All", ...Array.from(new Set(rooms.map((r) => r.category)))];

  const handlePriceChange = (roomId: string, val: string) => {
    const num = parseInt(val, 10);
    setEditedPrices((prev) => ({
      ...prev,
      [roomId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSavePrice = async (room: Room) => {
    const newPrice = editedPrices[room.id] !== undefined ? editedPrices[room.id] : room.price;
    if (newPrice < 100 || newPrice > 50000) {
      errorToast("Validation Error", "Price must be between 100 and 50,000 BDT.");
      return;
    }

    try {
      setSavingId(room.id);
      const updated = await updateRoomPrice(room.id, newPrice);
      setRooms((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, price: updated.price } : r))
      );
      setEditedPrices((prev) => {
        const next = { ...prev };
        delete next[room.id];
        return next;
      });
      successToast("Price Updated", `Room ${room.roomNumber} price updated to ${formatCurrency(newPrice)}.`);
    } catch (err: any) {
      errorToast("Update Failed", err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleApplyBulk = async () => {
    const matchingRooms = rooms.filter((r) => r.category.toLowerCase() === bulkCategory.toLowerCase());
    if (matchingRooms.length === 0) {
      errorToast("No Rooms Found", `No rooms found in category "${bulkCategory}".`);
      return;
    }

    if (!window.confirm(`Apply price adjustment to all ${matchingRooms.length} rooms in category "${bulkCategory}"?`)) {
      return;
    }

    try {
      setBulkApplying(true);
      for (const r of matchingRooms) {
        let nextPrice = r.price;
        if (bulkAdjustmentType === "percent") {
          nextPrice = Math.round(r.price * (1 + bulkValue / 100));
        } else {
          nextPrice = Math.round(r.price + bulkValue);
        }
        nextPrice = Math.min(50000, Math.max(100, nextPrice));
        await updateRoomPrice(r.id, nextPrice);
      }

      successToast("Bulk Pricing Applied", `Updated rates for ${matchingRooms.length} rooms.`);
      await loadRooms();
      setEditedPrices({});
    } catch (err: any) {
      errorToast("Bulk Update Error", err.message);
    } finally {
      setBulkApplying(false);
    }
  };

  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      String(r.roomNumber).includes(search.trim());
    const matchesCategory =
      selectedCategory === "All" || r.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Banknote className="size-4" />
            Rooms & Rates Settings
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Room Pricing & Rate Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust nightly prices individually or bulk-adjust room rates across categories and tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRooms}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition self-start sm:self-auto"
        >
          <RotateCcw className="size-3.5" />
          Refresh Rates
        </button>
      </div>

      {/* Bulk Pricing Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4 text-primary" />
          Bulk Rate Adjustment Tool
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Room Category
            </label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Adjustment Type
            </label>
            <select
              value={bulkAdjustmentType}
              onChange={(e) => setBulkAdjustmentType(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="percent">Percentage Change (%)</option>
              <option value="fixed">Fixed Amount (৳ BDT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Adjustment Value ({bulkAdjustmentType === "percent" ? "+/- %" : "+/- ৳"})
            </label>
            <input
              type="number"
              value={bulkValue}
              onChange={(e) => setBulkValue(Number(e.target.value))}
              placeholder="e.g. 10 or -5"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            disabled={bulkApplying}
            onClick={handleApplyBulk}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition disabled:opacity-50 h-[38px]"
          >
            {bulkApplying ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <TrendingUp className="size-3.5" />
                Apply to Category
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search room number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Current Rate</th>
                <th className="px-6 py-4 font-semibold">New Nightly Price (BDT)</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                    Loading room inventory rates...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No rooms found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((room) => {
                  const draftPrice = editedPrices[room.id] !== undefined ? editedPrices[room.id] : room.price;
                  const hasChanged = draftPrice !== room.price;

                  return (
                    <tr key={room.id} className="hover:bg-muted/30 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">Room {room.roomNumber}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {room.name}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          {room.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {room.capacity} Guests • {room.bedCount} {room.bedType}
                      </td>

                      <td className="px-6 py-4 font-semibold text-foreground">
                        {formatCurrency(room.price)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="relative max-w-[150px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            ৳
                          </span>
                          <input
                            type="number"
                            min={100}
                            max={50000}
                            value={draftPrice}
                            onChange={(e) => handlePriceChange(room.id, e.target.value)}
                            className={`w-full rounded-xl border pl-7 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
                              hasChanged
                                ? "border-amber-500 bg-amber-500/10 font-bold"
                                : "border-border bg-background"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={!hasChanged || savingId === room.id}
                          onClick={() => handleSavePrice(room)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                            hasChanged
                              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-xs cursor-pointer"
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-40"
                          }`}
                        >
                          {savingId === room.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Save className="size-3.5" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
