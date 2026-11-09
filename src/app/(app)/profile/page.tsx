"use client";

import { useEffect, useState } from "react";
import ProfilePage from "@/components/profile/ProfilePage";
import { ProtectedContent } from "@/providers/protected-content";
import { useAuth } from "@/providers/AuthContext";
import { apiFetch } from "@/lib/api";
import { GuestProfile } from "@/types/profile";
import { errorToast, successToast } from "@/components/ui/toast";

function ProfileContent({ userId }: { userId: string }) {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Check OAuth return params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const connectSuccess = params.get("connectSuccess");
      const connectError = params.get("connectError");

      if (connectSuccess) {
        successToast(`${connectSuccess} account connected successfully.`);
        window.history.replaceState({}, "", window.location.pathname);
      } else if (connectError) {
        errorToast(decodeURIComponent(connectError));
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    apiFetch("/api/profile", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load profile: ${res.status}`);
        }
        const data: GuestProfile = await res.json();
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
        if (isMounted) {
          errorToast("Could not load your profile. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, refreshIndex]);

  async function handleProfileSave(updated: GuestProfile) {
    try {
      const payload = {
        name: updated.name,
        preferredName: updated.preferredName,
        phoneNumber: updated.phoneNumber,
        nationalId: updated.nationalId,
        passportNumber: updated.passportNumber,
        dateOfBirth: updated.dateOfBirth,
        address: updated.address,
        city: updated.city,
        country: updated.country,
        postalCode: updated.postalCode,
        about: updated.about,
        preferredRoomType: updated.preferredRoomType,
        preferredBedType: updated.preferredBedType,
        preferredFloor: updated.preferredFloor,
        smokingPreference: updated.smokingPreference,
        accessibilityNeeds: updated.accessibilityNeeds,
      };

      const res = await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || "Failed to update profile.";
        errorToast(errorMsg);
        throw new Error(errorMsg);
      }

      setProfile(data);
      await refreshUser();
      successToast("Profile updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Profile update failed.";
      throw new Error(msg);
    }
  }

  async function handlePasswordChange(currentPassword: string, newPassword: string) {
    try {
      const res = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword.trim() ? currentPassword : null,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg =
          data.message ||
          (Array.isArray(data.errors) ? data.errors.join(", ") : "Failed to change password.");
        errorToast(errorMsg);
        throw new Error(errorMsg);
      }

      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
      successToast(data.message || "Password updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      throw new Error(msg);
    }
  }

  function handleAccountConnect(provider: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5052";
    const targetUrl = new URL(`/api/profile/connected-accounts/link/${encodeURIComponent(provider.toLowerCase())}`, apiUrl);
    window.location.assign(targetUrl.toString());
  }

  async function handleAccountDisconnect(provider: string) {
    try {
      const res = await apiFetch(`/api/profile/connected-accounts/${provider.toLowerCase()}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || `Could not disconnect ${provider}.`;
        errorToast(errorMsg);
        throw new Error(errorMsg);
      }

      successToast(`${provider} disconnected successfully.`);
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Could not disconnect ${provider}.`;
      throw new Error(msg);
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfilePage
      profile={profile}
      onProfileSave={handleProfileSave}
      onPasswordChange={handlePasswordChange}
      onAccountConnect={handleAccountConnect}
      onAccountDisconnect={handleAccountDisconnect}
    />
  );
}

export default function ProfileRoute() {
  const { user } = useAuth();

  return (
    <ProtectedContent>
      {user ? <ProfileContent key={user.id} userId={user.id} /> : null}
    </ProtectedContent>
  );
}
