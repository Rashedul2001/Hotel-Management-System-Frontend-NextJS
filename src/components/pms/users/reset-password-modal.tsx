"use client";

import React, { useState } from "react";
import { X, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetUserPassword, type ManagedUser } from "@/lib/users-roles-api";
import { toast } from "sonner";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user?: ManagedUser | null;
}

export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await resetUserPassword(user.id, newPassword);
      toast.success(`Password for '${user.fullName}' reset successfully.`);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Reset Password</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {user.fullName} ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">New Password *</label>
            <Input
              required
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Confirm Password *</label>
            <Input
              required
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Set Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
