"use client";

//_____________________________________________________________________________________//

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthContext";
import { apiFetch } from "@/lib/api";

//_____________________________________________________________________________________//

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit3,
  ExternalLink,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserRound,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import "@/styles/profile.css";

import type {
  GuestBooking,
  GuestProfile,
  NotificationPreferences,
  ProfilePageProps,
} from "@/types/profile";
import { errorToast, infoToast, successToast } from "../ui/toast";

const EMPTY_VALUE = "Not provided";

function displayValue(value?: string) {
  return value?.trim() ? value : EMPTY_VALUE;
}

function getProfileCompletion(profile: GuestProfile) {
  const fields = [
    profile.name,
    profile.email,
    profile.phoneNumber,
    profile.nationalId,
    profile.dateOfBirth,
    profile.address,
    profile.city,
    profile.country,
    profile.postalCode,
    profile.about,
    profile.profileImageUrl,
    profile.preferredRoomType,
    profile.preferredBedType,
  ];

  return Math.round(
    (fields.filter((value) => Boolean(value?.toString().trim())).length /
      fields.length) *
      100,
  );
}

function formatDate(value?: string) {
  if (!value) return EMPTY_VALUE;
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function formatDateTime(value?: string) {
  if (!value) return EMPTY_VALUE;
  try {
    return format(parseISO(value), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return value;
  }
}

function bookingStatusClass(status: GuestBooking["status"]) {
  switch (status) {
    case "Confirmed":
      return "profile-status profile-status-success";
    case "Checked In":
      return "profile-status profile-status-info";
    case "Completed":
      return "profile-status profile-status-neutral";
    case "Cancelled":
      return "profile-status profile-status-danger";
    default:
      return "profile-status profile-status-warning";
  }
}

export default function ProfilePage({
  profile: initialProfile,
  onProfileSave,
  onPasswordChange,
  onPasswordReset,
  onTwoFactorToggle,
  onNotificationPreferencesChange,
}: ProfilePageProps) {
  //_____________________________________________________________________________________//

  const { user, refreshUser } = useAuth();
  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      infoToast("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      infoToast("Profile images must be 5 MB or smaller.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch("/api/profile/picture", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        errorToast(
          data.message ?? "Profile picture upload failed.",
          "Please try again",
        );
        return;
      }

      await refreshUser();

      successToast(
        "Profile photo updated.",
        "You can change it whenever you want.",
      );
    } catch {
      errorToast(
        "The profile photo could not be updated.",
        "Please try again sometimes later",
      );
    }
  }

  //_____________________________________________________________________________________//

  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const upcomingBookings = useMemo(
    () =>
      profile.bookings
        .filter(
          (booking) =>
            booking.status === "Confirmed" || booking.status === "Pending",
        )
        .slice(0, 3),
    [profile.bookings],
  );

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: profile.name,
      username: profile.username ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      nationalId: profile.nationalId ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      postalCode: profile.postalCode ?? "",
      about: profile.about ?? "",
      preferredRoomType: profile.preferredRoomType ?? "",
      preferredBedType: profile.preferredBedType ?? "",
      preferredFloor: profile.preferredFloor ?? "No preference",
      smokingPreference: profile.smokingPreference ?? "Non-smoking",
      accessibilityNeeds: profile.accessibilityNeeds ?? "",
    },
  });

  function startEditing() {
    reset({
      name: profile.name,
      username: profile.username ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      nationalId: profile.nationalId ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      postalCode: profile.postalCode ?? "",
      about: profile.about ?? "",
      preferredRoomType: profile.preferredRoomType ?? "",
      preferredBedType: profile.preferredBedType ?? "",
      preferredFloor: profile.preferredFloor ?? "No preference",
      smokingPreference: profile.smokingPreference ?? "Non-smoking",
      accessibilityNeeds: profile.accessibilityNeeds ?? "",
    });
    setIsEditing(true);
    setMessage(null);
  }

  async function saveProfile(values: Record<string, string>) {
    const updated: GuestProfile = {
      ...profile,
      name: values.name.trim(),
      username: values.username.trim() || undefined,
      phoneNumber: values.phoneNumber.trim() || undefined,
      nationalId: values.nationalId.trim() || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      address: values.address.trim() || undefined,
      city: values.city.trim() || undefined,
      country: values.country.trim() || undefined,
      postalCode: values.postalCode.trim() || undefined,
      about: values.about.trim() || undefined,
      preferredRoomType: values.preferredRoomType || undefined,
      preferredBedType: values.preferredBedType || undefined,
      preferredFloor: values.preferredFloor as GuestProfile["preferredFloor"],
      smokingPreference:
        values.smokingPreference as GuestProfile["smokingPreference"],
      accessibilityNeeds: values.accessibilityNeeds.trim() || undefined,
    };

    try {
      setSaving(true);
      await onProfileSave?.(updated);
      setProfile(updated);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("The profile could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTwoFactor() {
    const nextValue = !profile.twoFactorEnabled;

    try {
      await onTwoFactorToggle?.(nextValue);
      setProfile((current) => ({ ...current, twoFactorEnabled: nextValue }));
      setMessage(
        nextValue
          ? "Two-factor authentication enabled."
          : "Two-factor authentication disabled.",
      );
    } catch {
      setMessage("Two-factor authentication could not be changed.");
    }
  }

  async function updatePreferences(preferences: NotificationPreferences) {
    try {
      await onNotificationPreferencesChange?.(preferences);
      setProfile((current) => ({
        ...current,
        notificationPreferences: preferences,
      }));
      setPreferencesOpen(false);
      setMessage("Notification preferences updated.");
    } catch {
      setMessage("Notification preferences could not be updated.");
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-page-header">
          <div>
            <h1 className="profile-page-title">My Profile</h1>
            <p className="profile-page-subtitle">
              Manage your personal details, reservations, preferences, and
              account security.
            </p>
          </div>
          <div className="profile-header-actions">
            <Link
              href="/bookings"
              className="profile-button profile-button-secondary"
            >
              <CalendarDays size={18} />
              My bookings
            </Link>
            <button
              type="button"
              onClick={() => setPreferencesOpen(true)}
              className="profile-button profile-button-secondary"
            >
              <Settings size={18} />
              Preferences
            </button>
          </div>
        </header>

        {/* {message && (
          <div className="profile-alert profile-alert-info" role="status">
            <Check size={18} />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )} */}

        <section className="profile-hero profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {user?.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt={`${user.fullName}'s profile`}
                  width={300} height={300}
                />
              ) : (
                <UserRound size={68} strokeWidth={1.6} />
              )}
            </div>

            <button
              type="button"
              className="profile-avatar-edit"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              <Camera size={17} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handlePhoto}
            />
          </div>

          <div className="profile-hero-content">
            <div className="profile-identity">
              <div>
                <div className="profile-name-row">
                  <h2>{displayValue(profile.name)}</h2>
                  {profile.emailVerified && (
                    <span className="profile-verified-badge">
                      <BadgeCheck size={17} />
                      Verified guest
                    </span>
                  )}
                </div>
                <p className="profile-email">
                  <Mail size={16} />
                  {profile.email}
                </p>
                <p className="profile-member-since">
                  Member since {formatDate(profile.memberSince)}
                </p>
              </div>

              <button
                type="button"
                onClick={startEditing}
                className="profile-button profile-button-primary"
              >
                <Edit3 size={18} />
                Edit profile
              </button>
            </div>

            <div className="profile-completion">
              <div className="profile-progress-heading">
                <span>Profile completion</span>
                <strong>{completion}%</strong>
              </div>
              <div
                className="profile-progress-track"
                aria-label={`Profile completion ${completion}%`}
              >
                <div
                  className="profile-progress-value"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p>
                {completion < 80
                  ? "Complete your profile to make future reservations faster."
                  : "Your profile is ready for a smoother hotel experience."}
              </p>
            </div>
          </div>

          <div className="profile-stat-grid">
            <StatCard
              icon={<CalendarDays />}
              value={profile.bookings.length}
              label="Bookings"
            />
            <StatCard
              icon={<Star />}
              value={profile.reviewCount}
              label="Reviews"
            />
            <StatCard
              icon={<CreditCard />}
              value={profile.loyaltyPoints ?? 0}
              label="Loyalty points"
            />
          </div>
        </section>

        <div className="profile-content-grid">
          <div className="profile-main-column">
            <section
              className="profile-card profile-section"
              id="personal-information"
            >
              <SectionHeader
                icon={<User />}
                title="Personal information"
                description="The details used for reservations and guest communication."
                action={
                  <button
                    type="button"
                    onClick={startEditing}
                    className="profile-icon-button"
                    aria-label="Edit personal information"
                  >
                    <Edit3 size={18} />
                  </button>
                }
              />

              {isEditing ? (
                <form
                  onSubmit={handleSubmit(saveProfile)}
                  className="profile-form"
                >
                  <div className="profile-form-grid">
                    <Field
                      label="Full name"
                      icon={<UserRound size={16} />}
                      error={undefined}
                    >
                      <input
                        {...register("name", { required: "Name is required" })}
                      />
                    </Field>
                    <Field label="Username" icon={<UserRound size={16} />}>
                      <input {...register("username")} />
                    </Field>
                    <Field label="Email address" icon={<Mail size={16} />}>
                      <div className="profile-input-with-status">
                        <input value={profile.email} readOnly />
                        {profile.emailVerified && (
                          <BadgeCheck
                            size={17}
                            className="profile-success-icon"
                          />
                        )}
                      </div>
                      <small>
                        Email changes should be handled through account
                        verification.
                      </small>
                    </Field>
                    <Field label="Phone number" icon={<Phone size={16} />}>
                      <input
                        {...register("phoneNumber")}
                        type="tel"
                        autoComplete="tel"
                      />
                    </Field>
                    <Field label="National ID" icon={<CreditCard size={16} />}>
                      <input {...register("nationalId")} autoComplete="off" />
                    </Field>
                    <Field
                      label="Date of birth"
                      icon={<CalendarDays size={16} />}
                    >
                      <input {...register("dateOfBirth")} type="date" />
                    </Field>
                    <Field label="Address" icon={<MapPin size={16} />}>
                      <input
                        {...register("address")}
                        autoComplete="street-address"
                      />
                    </Field>
                    <Field label="City" icon={<MapPin size={16} />}>
                      <input
                        {...register("city")}
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="Country" icon={<Globe2 size={16} />}>
                      <input
                        {...register("country")}
                        autoComplete="country-name"
                      />
                    </Field>
                    <Field label="Postal code" icon={<MapPin size={16} />}>
                      <input
                        {...register("postalCode")}
                        autoComplete="postal-code"
                      />
                    </Field>
                  </div>

                  <Field label="About me" icon={<MessageSquare size={16} />}>
                    <textarea {...register("about")} rows={4} maxLength={500} />
                  </Field>

                  <div className="profile-form-divider" />
                  <div>
                    <h3 className="profile-subsection-title">
                      Stay preferences
                    </h3>
                    <p className="profile-help-text">
                      Save preferences that can be used when creating future
                      reservations. They do not replace a booking-specific
                      request.
                    </p>
                  </div>

                  <div className="profile-form-grid">
                    <Field label="Preferred room type">
                      <select {...register("preferredRoomType")}>
                        <option value="">No preference</option>
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Family">Family</option>
                      </select>
                    </Field>
                    <Field label="Preferred bed type">
                      <select {...register("preferredBedType")}>
                        <option value="">No preference</option>
                        <option value="Single">Single</option>
                        <option value="Twin">Twin</option>
                        <option value="Double">Double</option>
                        <option value="King">King</option>
                        <option value="Queen">Queen</option>
                      </select>
                    </Field>
                    <Field label="Preferred floor">
                      <select {...register("preferredFloor")}>
                        <option value="No preference">No preference</option>
                        <option value="Low">Low</option>
                        <option value="Middle">Middle</option>
                        <option value="High">High</option>
                      </select>
                    </Field>
                    <Field label="Smoking preference">
                      <select {...register("smokingPreference")}>
                        <option value="Non-smoking">Non-smoking</option>
                        <option value="Smoking">Smoking</option>
                        <option value="No preference">No preference</option>
                      </select>
                    </Field>
                  </div>

                  <Field
                    label="Accessibility needs"
                    icon={<ShieldCheck size={16} />}
                  >
                    <textarea
                      {...register("accessibilityNeeds")}
                      rows={3}
                      maxLength={500}
                      placeholder="Optional information that may help the hotel prepare your stay."
                    />
                  </Field>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="profile-button profile-button-secondary"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="profile-button profile-button-primary"
                    >
                      <Save size={18} />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  <InfoItem
                    label="Full name"
                    value={profile.name}
                    icon={<UserRound />}
                  />
                  <InfoItem
                    label="Username"
                    value={profile.username}
                    icon={<UserRound />}
                  />
                  <InfoItem
                    label="Email address"
                    value={profile.email}
                    icon={<Mail />}
                    verified={profile.emailVerified}
                  />
                  <InfoItem
                    label="Phone number"
                    value={profile.phoneNumber}
                    icon={<Phone />}
                    verified={profile.phoneVerified}
                  />
                  <InfoItem
                    label="National ID"
                    value={profile.nationalId}
                    icon={<CreditCard />}
                    privateValue
                  />
                  <InfoItem
                    label="Date of birth"
                    value={formatDate(profile.dateOfBirth)}
                    icon={<CalendarDays />}
                  />
                  <InfoItem
                    label="Address"
                    value={profile.address}
                    icon={<MapPin />}
                  />
                  <InfoItem
                    label="Location"
                    value={[profile.city, profile.country]
                      .filter(Boolean)
                      .join(", ")}
                    icon={<Globe2 />}
                  />
                  <InfoItem
                    label="Postal code"
                    value={profile.postalCode}
                    icon={<MapPin />}
                  />
                  <div className="profile-info-item profile-info-item-wide">
                    <div className="profile-info-label">
                      <MessageSquare size={16} /> About me
                    </div>
                    <p>{displayValue(profile.about)}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<ShieldCheck />}
                title="Login & security"
                description="Protect your account and control how you sign in."
              />

              <div className="profile-security-grid">
                <SecurityItem
                  icon={<Mail />}
                  title="Email verification"
                  description={
                    profile.emailVerified
                      ? "Your email is verified."
                      : "Your email still needs verification."
                  }
                  status={profile.emailVerified ? "Verified" : "Pending"}
                  positive={profile.emailVerified}
                />
                <SecurityItem
                  icon={<Phone />}
                  title="Phone verification"
                  description={
                    profile.phoneVerified
                      ? "Your phone is verified."
                      : "Add and verify a phone number for account recovery."
                  }
                  status={profile.phoneVerified ? "Verified" : "Pending"}
                  positive={profile.phoneVerified}
                />
                <div className="profile-security-item">
                  <div className="profile-security-icon profile-security-icon-blue">
                    <KeyRound />
                  </div>
                  <div className="profile-security-body">
                    <div className="profile-security-title-row">
                      <h3>Password</h3>
                    </div>
                    <p>
                      Last changed: {formatDate(profile.lastPasswordChange)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="profile-link-button"
                    onClick={() => setPasswordOpen(true)}
                  >
                    Change
                  </button>
                </div>
                <div className="profile-security-item">
                  <div className="profile-security-icon profile-security-icon-purple">
                    <LockKeyhole />
                  </div>
                  <div className="profile-security-body">
                    <div className="profile-security-title-row">
                      <h3>Two-factor authentication</h3>
                      <span
                        className={
                          profile.twoFactorEnabled
                            ? "profile-mini-badge success"
                            : "profile-mini-badge warning"
                        }
                      >
                        {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p>
                      {profile.twoFactorEnabled
                        ? "Extra protection is active."
                        : "Add an additional verification step when signing in."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="profile-link-button"
                    onClick={toggleTwoFactor}
                  >
                    {profile.twoFactorEnabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>

              <div className="profile-login-meta">
                <Clock3 size={17} />
                <span>Last login: {formatDateTime(profile.lastLoginAt)}</span>
              </div>
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<CalendarDays />}
                title="Recent reservations"
                description="A quick view of your latest hotel stays."
                action={
                  <Link href="/bookings" className="profile-link-button">
                    View all
                    <ChevronRight size={16} />
                  </Link>
                }
              />

              {profile.bookings.length > 0 ? (
                <div className="profile-booking-list">
                  {profile.bookings.slice(0, 5).map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays />}
                  title="No reservations yet"
                  description="Your reservations will appear here after you make a booking."
                  href="/rooms"
                  action="Browse rooms"
                />
              )}
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<Clock3 />}
                title="Recent activity"
                description="Important changes and guest-account activity."
              />

              {profile.activities.length > 0 ? (
                <div className="profile-activity-list">
                  {profile.activities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="profile-activity-item">
                      <div className="profile-activity-icon">
                        {activity.icon === "security" ? (
                          <ShieldCheck />
                        ) : activity.icon === "review" ? (
                          <Star />
                        ) : activity.icon === "profile" ? (
                          <User />
                        ) : (
                          <CalendarDays />
                        )}
                      </div>
                      <div className="profile-activity-body">
                        <h3>{activity.title}</h3>
                        <p>{activity.description}</p>
                        <time>{formatDateTime(activity.date)}</time>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Clock3 />}
                  title="No recent activity"
                  description="Account activity will appear here."
                />
              )}
            </section>
          </div>

          <aside className="profile-sidebar">
            <section className="profile-card profile-section ">
              <SectionHeader
                icon={<Star />}
                title="Guest benefits"
                description="Your hotel membership information."
              />
              <div className="profile-loyalty">
                <div className="profile-loyalty-tier">
                  <span>Membership</span>
                  <strong>{profile.loyaltyTier || "Guest"}</strong>
                </div>
                <div className="profile-loyalty-points">
                  <strong>{profile.loyaltyPoints ?? 0}</strong>
                  <span>points</span>
                </div>
              </div>
              <div className="profile-benefit-list">
                <BenefitRow text="Faster booking with saved preferences" />
                <BenefitRow text="Centralized reservation history" />
                <BenefitRow text="Personalized guest communication" />
              </div>
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<Bell />}
                title="Notifications"
                description="Control non-security communications."
              />
              <PreferenceRow
                label="Booking updates"
                checked={profile.notificationPreferences.bookingUpdates}
                onChange={(checked) =>
                  updatePreferences({
                    ...profile.notificationPreferences,
                    bookingUpdates: checked,
                  })
                }
              />
              <PreferenceRow
                label="Review reminders"
                checked={profile.notificationPreferences.reviewReminders}
                onChange={(checked) =>
                  updatePreferences({
                    ...profile.notificationPreferences,
                    reviewReminders: checked,
                  })
                }
              />
              <PreferenceRow
                label="Promotional offers"
                checked={profile.notificationPreferences.promotionalOffers}
                onChange={(checked) =>
                  updatePreferences({
                    ...profile.notificationPreferences,
                    promotionalOffers: checked,
                  })
                }
              />
              <div className="profile-note">
                <ShieldCheck size={16} />
                Security alerts cannot be disabled from this page.
              </div>
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<Settings />}
                title="Quick actions"
                description="Common guest account tasks."
              />
              <QuickAction
                href="/bookings"
                icon={<CalendarDays />}
                title="My bookings"
                description="View and manage reservations"
              />
              <QuickAction
                href="/reviews"
                icon={<Star />}
                title="My reviews"
                description="Review your hotel experiences"
              />
              <QuickAction
                href="/support"
                icon={<MessageSquare />}
                title="Help & support"
                description="Get assistance from the hotel"
              />
            </section>

            <section className="profile-card profile-section">
              <SectionHeader
                icon={<Globe2 />}
                title="Connected accounts"
                description="External sign-in connections."
              />
              <ConnectedAccount
                name="Google"
                connected={profile.connectedAccounts.google}
              />
              <ConnectedAccount
                name="Facebook"
                connected={profile.connectedAccounts.facebook}
              />
              <ConnectedAccount
                name="Apple"
                connected={profile.connectedAccounts.apple}
              />
            </section>

            <section className="profile-card profile-section profile-danger-card">
              <SectionHeader
                icon={<AlertTriangle />}
                title="Danger zone"
                description="These actions may affect access to your account."
              />
              <button
                type="button"
                className="profile-danger-button"
                onClick={() => setResetOpen(true)}
              >
                <KeyRound size={17} />
                Reset password
              </button>
              <button type="button" className="profile-danger-button">
                <Trash2 size={17} />
                Request account deletion
              </button>
              <p className="profile-help-text">
                Account deletion should be confirmed through your backend before
                any data is permanently removed.
              </p>
            </section>
          </aside>
        </div>

        {upcomingBookings.length > 0 && (
          <section className="profile-card profile-upcoming">
            <div>
              <p className="profile-eyebrow">Next stay</p>
              <h2>Upcoming reservation</h2>
            </div>
            <div className="profile-upcoming-list">
              {upcomingBookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      <PasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={async (currentPassword, newPassword) => {
          await onPasswordChange?.(currentPassword, newPassword);
          setPasswordOpen(false);
          setMessage("Password changed successfully.");
        }}
      />

      <ResetPasswordModal
        open={resetOpen}
        email={profile.email}
        onClose={() => setResetOpen(false)}
        onSubmit={async () => {
          await onPasswordReset?.();
          setResetOpen(false);
          setMessage(
            "If the account is eligible, a password reset message has been requested.",
          );
        }}
      />

      <PreferencesModal
        open={preferencesOpen}
        preferences={profile.notificationPreferences}
        onClose={() => setPreferencesOpen(false)}
        onSave={updatePreferences}
      />
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="profile-stat">
      <div className="profile-stat-icon">{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="profile-section-header">
      <div className="profile-section-heading">
        <div className="profile-section-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  error,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="profile-field">
      <span className="profile-field-label">
        {icon}
        {label}
      </span>
      {children}
      {error && <small className="profile-field-error">{error}</small>}
    </label>
  );
}

function InfoItem({
  label,
  value,
  icon,
  verified,
  privateValue,
}: {
  label: string;
  value?: string;
  icon: React.ReactNode;
  verified?: boolean;
  privateValue?: boolean;
}) {
  const shown =
    privateValue && value
      ? `${value.slice(0, 2)}••••${value.slice(-2)}`
      : displayValue(value);

  return (
    <div className="profile-info-item">
      <div className="profile-info-label">
        {icon}
        {label}
      </div>
      <div
        className={value ? "profile-info-value" : "profile-info-value muted"}
      >
        {shown}
        {verified && <BadgeCheck size={16} className="profile-success-icon" />}
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  description,
  status,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  positive: boolean;
}) {
  return (
    <div className="profile-security-item">
      <div
        className={`profile-security-icon ${positive ? "profile-security-icon-green" : "profile-security-icon-yellow"}`}
      >
        {icon}
      </div>
      <div className="profile-security-body">
        <div className="profile-security-title-row">
          <h3>{title}</h3>
          <span
            className={`profile-mini-badge ${positive ? "success" : "warning"}`}
          >
            {status}
          </span>
        </div>
        <p>{description}</p>
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  compact = false,
}: {
  booking: GuestBooking;
  compact?: boolean;
}) {
  return (
    <div className={`profile-booking-row ${compact ? "compact" : ""}`}>
      <div className="profile-booking-icon">
        <CalendarDays />
      </div>
      <div className="profile-booking-main">
        <div className="profile-booking-title-row">
          <h3>{booking.hotelName}</h3>
          <span className={bookingStatusClass(booking.status)}>
            {booking.status}
          </span>
        </div>
        <p>
          {booking.roomName} · #{booking.id}
        </p>
        <p className="profile-booking-dates">
          {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
        </p>
      </div>
      <div className="profile-booking-amount">
        <strong>
          {booking.currency} {booking.amount.toLocaleString()}
        </strong>
        {!compact && (
          <a href={`/bookings/${booking.id}`}>
            Details <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

function PreferenceRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="profile-switch-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="profile-switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="profile-benefit-row">
      <Check size={15} />
      <span>{text}</span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a href={href} className="profile-quick-action">
      <div className="profile-quick-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <ChevronRight size={17} />
    </a>
  );
}

function ConnectedAccount({
  name,
  connected,
}: {
  name: string;
  connected: boolean;
}) {
  return (
    <div className="profile-connected-account">
      <div className="profile-connected-logo">{name.slice(0, 1)}</div>
      <div>
        <strong>{name}</strong>
        <span>{connected ? "Connected" : "Not connected"}</span>
      </div>
      <span
        className={
          connected
            ? "profile-connected-status active"
            : "profile-connected-status"
        }
      >
        {connected ? "Active" : "Connect"}
      </span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="profile-empty-state">
      <div className="profile-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && action && (
        <a href={href} className="profile-button profile-button-primary">
          {action}
        </a>
      )}
    </div>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="profile-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="profile-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const newPassword = watch("newPassword");

  return (
    <Modal open={open} title="Change password" onClose={onClose}>
      <form
        className="profile-modal-form"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values.currentPassword, values.newPassword);
          reset();
        })}
      >
        <Field label="Current password">
          <input
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            type="password"
            autoComplete="current-password"
          />
        </Field>
        {errors.currentPassword && (
          <small className="profile-field-error">
            {errors.currentPassword.message}
          </small>
        )}

        <Field label="New password">
          <input
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "Use at least 8 characters." },
            })}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        {errors.newPassword && (
          <small className="profile-field-error">
            {errors.newPassword.message}
          </small>
        )}

        <Field label="Confirm new password">
          <input
            {...register("confirmPassword", {
              required: "Please confirm the new password.",
              validate: (value) =>
                value === newPassword || "Passwords do not match.",
            })}
            type="password"
            autoComplete="new-password"
          />
        </Field>
        {errors.confirmPassword && (
          <small className="profile-field-error">
            {errors.confirmPassword.message}
          </small>
        )}

        <div className="profile-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="profile-button profile-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="profile-button profile-button-primary"
          >
            <Save size={17} /> Update password
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResetPasswordModal({
  open,
  email,
  onClose,
  onSubmit,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <Modal open={open} title="Reset password" onClose={onClose}>
      <div className="profile-reset-content">
        <div className="profile-reset-icon">
          <KeyRound />
        </div>
        <p>
          A password-reset message will be requested for{" "}
          <strong>{email}</strong>. Your backend should decide whether to issue
          the reset token and invalidate active sessions.
        </p>
      </div>
      <div className="profile-modal-actions">
        <button
          type="button"
          onClick={onClose}
          className="profile-button profile-button-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="profile-button profile-button-primary"
        >
          <Mail size={17} /> Send reset link
        </button>
      </div>
    </Modal>
  );
}

function PreferencesModal({
  open,
  preferences,
  onClose,
  onSave,
}: {
  open: boolean;
  preferences: NotificationPreferences;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}) {
  const [draft, setDraft] = useState(preferences);

  if (!open) return null;

  return (
    <Modal open={open} title="Notification preferences" onClose={onClose}>
      <div className="profile-modal-form">
        <PreferenceRow
          label="Booking updates"
          checked={draft.bookingUpdates}
          onChange={(checked) =>
            setDraft({ ...draft, bookingUpdates: checked })
          }
        />
        <PreferenceRow
          label="Review reminders"
          checked={draft.reviewReminders}
          onChange={(checked) =>
            setDraft({ ...draft, reviewReminders: checked })
          }
        />
        <PreferenceRow
          label="Promotional offers"
          checked={draft.promotionalOffers}
          onChange={(checked) =>
            setDraft({ ...draft, promotionalOffers: checked })
          }
        />
        <PreferenceRow
          label="Security alerts"
          checked={draft.securityAlerts}
          onChange={(checked) =>
            setDraft({ ...draft, securityAlerts: checked })
          }
        />
        <p className="profile-help-text">
          Security notifications should normally remain enabled so guests can
          receive important account alerts.
        </p>
        <div className="profile-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="profile-button profile-button-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="profile-button profile-button-primary"
          >
            <Save size={17} /> Save preferences
          </button>
        </div>
      </div>
    </Modal>
  );
}
