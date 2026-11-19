"use client";

import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Top Row: Icon & Close */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
              isDestructive
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isDestructive ? (
              <Trash2 className="size-5" />
            ) : (
              <AlertCircle className="size-5" />
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3
            id="confirm-modal-title"
            className="text-lg font-bold tracking-tight text-foreground"
          >
            {title}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Highlighted item name box if provided */}
        {itemName && (
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 text-xs text-foreground font-semibold flex items-center gap-2">
            <span className="size-2 rounded-full bg-destructive shrink-0" />
            <span className="truncate">{itemName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-xl border border-border px-4 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 ${
              isDestructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
