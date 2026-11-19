"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRightLeft,
  Bed,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRooms, type Room } from "@/lib/admin-rooms-api";
import { reassignRoom, type Reservation } from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

interface ReassignRoomModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReassignRoomModal({
  reservation,
  isOpen,
  onClose,
  onSuccess,
}: ReassignRoomModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await getRooms({ pageSize: 100 });
      // Exclude current room
      const otherRooms = (res.rooms || []).filter((r) => r.id !== reservation?.roomId);
      setRooms(otherRooms);
      if (otherRooms.length > 0) {
        setTargetRoomId(otherRooms[0].id);
      }
    } catch (err) {
      console.warn("Failed to load rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  if (!isOpen || !reservation) return null;

  const targetRoom = rooms.find((r) => r.id === targetRoomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoomId) {
      toast.error("Please select a target room for transfer.");
      return;
    }

    try {
      setSubmitting(true);
      await reassignRoom(reservation.id, targetRoomId, reason.trim());
      toast.success(
        `Guest ${reservation.guestName} successfully transferred to Room #${targetRoom?.roomNumber || ""}.`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to transfer room");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Room Transfer</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reassign {reservation.guestName} to another room
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Current Room Info */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
            <div>
              <span className="text-muted-foreground block text-[11px]">Current Assigned Room</span>
              <p className="font-bold text-foreground text-sm mt-0.5">
                Room #{reservation.roomNumber} — {reservation.roomName}
              </p>
              <span className="text-[11px] text-muted-foreground">
                Category: {reservation.roomCategory} • {reservation.checkInDate} to {reservation.checkOutDate}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
              Active
            </span>
          </div>

          {/* New Room Selector */}
          <div>
            <label className="font-semibold text-foreground mb-1 block">
              Select Destination Room *
            </label>
            {loadingRooms ? (
              <div className="flex items-center gap-2 p-3 border rounded-xl text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading room options...
              </div>
            ) : (
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room #{r.roomNumber} — {r.name} ({r.category}) • Floor {r.floor} • {formatBDT(r.price)}/night • {r.status}
                  </option>
                ))}
              </select>
            )}
          </div>

          {targetRoom && (
            <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">Room #{targetRoom.roomNumber} - {targetRoom.name}</span>
                <p className="text-[11px] text-muted-foreground">
                  {targetRoom.category} • Floor {targetRoom.floor} • {targetRoom.capacity} Guests
                </p>
              </div>
              <p className="font-bold text-primary">{formatBDT(targetRoom.price)}/night</p>
            </div>
          )}

          <div>
            <label className="font-semibold text-foreground mb-1 block">
              Reason for Room Transfer
            </label>
            <Input
              placeholder="e.g. Guest requested higher floor, AC maintenance, suite upgrade..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl h-9 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting || !targetRoomId}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Transferring...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Execute Room Transfer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
