"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Settings,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Save,
} from "lucide-react";
import { errorToast, successToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  getHeroSetting,
  updateHeroImage,
  resetHeroImage,
  getHotelInfo,
  updateHotelInfo,
  type HeroSettingResponse,
  type HotelInfoResponse,
} from "@/lib/settings-api";

export default function SystemConfigurationPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "hotel">("hero");

  // Hero Section State
  const [heroData, setHeroData] = useState<HeroSettingResponse | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [resettingHero, setResettingHero] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hotel Info State
  const [hotelInfo, setHotelInfo] = useState<HotelInfoResponse>({
    hotelName: "Hotel Velora",
    tagline: "Luxury Sanctuary & Unrivaled Hospitality",
    address: "124 Marine Drive, Cox's Bazar, Bangladesh",
    phone: "+880 1700-000000",
    email: "concierge@hotelvelora.com",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    currency: "BDT",
  });
  const [hotelLoading, setHotelLoading] = useState(true);
  const [savingHotel, setSavingHotel] = useState(false);

  // Fetch Hero Settings
  const loadHeroSettings = async () => {
    try {
      setHeroLoading(true);
      const data = await getHeroSetting();
      setHeroData(data);
    } catch (err: any) {
      errorToast("Hero Setting Error", err.message || "Failed to load hero configuration.");
    } finally {
      setHeroLoading(false);
    }
  };

  // Fetch Hotel Info
  const loadHotelInfo = async () => {
    try {
      setHotelLoading(true);
      const data = await getHotelInfo();
      setHotelInfo(data);
    } catch {
      // Keep defaults if error
    } finally {
      setHotelLoading(false);
    }
  };

  useEffect(() => {
    loadHeroSettings();
    loadHotelInfo();
  }, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      errorToast("Invalid Format", "Please select a JPEG, PNG, or WebP image file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      errorToast("File Too Large", "Image size must be under 15 MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Save / Replace Hero Image
  const handleSaveHeroImage = async () => {
    if (!selectedFile && !manualUrl.trim()) {
      errorToast("No Image Provided", "Please select an image file or provide an image URL.");
      return;
    }

    try {
      setUploadingHero(true);
      const res = await updateHeroImage(selectedFile || undefined, manualUrl.trim() || undefined);
      setHeroData(res);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setManualUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      successToast("Hero Image Updated", "Hero section image has been uploaded to Cloudinary and live on the landing page.");
    } catch (err: any) {
      errorToast("Upload Failed", err.message || "Failed to update hero image.");
    } finally {
      setUploadingHero(false);
    }
  };

  // Reset Hero Image
  const handleResetHero = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetHero = async () => {
    try {
      setResettingHero(true);
      const res = await resetHeroImage();
      setHeroData(res);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setManualUrl("");
      setIsResetConfirmOpen(false);
      successToast("Hero Reset", "Hero image reset to default luxury banner.");
    } catch (err: any) {
      errorToast("Reset Failed", err.message || "Failed to reset hero image.");
    } finally {
      setResettingHero(false);
    }
  };

  // Save Hotel Info
  const handleSaveHotelInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingHotel(true);
      await updateHotelInfo(hotelInfo);
      successToast("Settings Saved", "Hotel information updated successfully.");
    } catch (err: any) {
      errorToast("Error", err.message || "Failed to save hotel info.");
    } finally {
      setSavingHotel(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Settings className="size-4" />
            System Configuration
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Property & Landing Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global property configuration, branding assets, and landing page hero media stored in Cloudinary.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-muted/70 p-1 border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "hero"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="size-3.5" />
            Hero Section Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hotel")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "hotel"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building className="size-3.5" />
            Hotel Information
          </button>
        </div>
      </div>

      {/* TAB 1: HERO SECTION CONFIGURATION */}
      {activeTab === "hero" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main Hero Media Editor */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Hero Section Background Image
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    This image is featured as the full-bleed backdrop of the public website hero section.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {heroData?.isCustom ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-3.5" />
                      Cloudinary Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                      Default Banner
                    </span>
                  )}
                </div>
              </div>

              {/* Current Hero Image Live Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Current Active Hero Banner:</span>
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    View on Live Landing Page
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-inner group">
                  {heroLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Image
                      src={previewUrl || heroData?.imageUrl || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90"}
                      alt="Hero Section Preview"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1200px) 100vw, 800px"
                      priority
                    />
                  )}

                  {/* Overlay Mockup Caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                    <span className="text-[10px] uppercase tracking-widest text-white/70">
                      Preview — Landing Page Hero
                    </span>
                    <h3 className="font-serif text-2xl font-light text-white">
                      Stay somewhere <span className="italic">beautiful.</span>
                    </h3>
                  </div>

                  {previewUrl && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                      Pending Upload
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="mt-6 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Replace Hero Image (Cloudinary Integration)
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 hover:bg-muted/40 transition cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    <UploadCloud className="size-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Click to browse or drop an image file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended resolution: 2400 × 1350 px (16:9). Maximum size: 15 MB.
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-primary">
                    Automatically uploaded and replaced in Cloudinary (`velora/hero`)
                  </p>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageIcon className="size-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Cloudinary
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }}
                      className="text-xs text-destructive hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Optional Manual URL Input */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Or enter external image URL:</span>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    disabled={resettingHero || (!heroData?.isCustom && !selectedFile)}
                    onClick={handleResetHero}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50"
                  >
                    {resettingHero ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    Reset to Default Banner
                  </button>

                  <button
                    type="button"
                    disabled={uploadingHero || (!selectedFile && !manualUrl.trim())}
                    onClick={handleSaveHeroImage}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadingHero ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Replacing in Cloudinary...
                      </>
                    ) : (
                      <>
                        <Save className="size-3.5" />
                        Save & Replace Hero Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Information Panel */}
          <div className="space-y-6">
            {/* Cloudinary Integration Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2.5 mb-3 text-foreground font-semibold text-sm">
                <ShieldCheck className="size-4 text-emerald-500" />
                Cloudinary Asset Storage
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Images uploaded through this control panel are stored securely on Cloudinary. When an image is replaced, the backend automatically destroys the previous asset in Cloudinary to prevent orphaned storage.
              </p>

              <div className="mt-4 space-y-2 rounded-xl bg-muted/40 p-3 border border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Folder:</span>
                  <span className="font-mono text-[11px] text-foreground">velora/hero</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Public ID:</span>
                  <span className="font-mono text-[11px] text-foreground truncate max-w-[170px]">
                    {heroData?.publicId || "Default Static"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="text-foreground">
                    {heroData?.updatedAt ? new Date(heroData.updatedAt).toLocaleDateString() : "System Default"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-sm">
                <Sparkles className="size-4 text-amber-500" />
                Visual Best Practices
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>Use expansive architectural or interior photography with natural lighting.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>Darker center and lower regions work best with the white hero typography.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>Aspect ratio of 16:9 or 21:9 guarantees optimal coverage across desktop and mobile screens.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOTEL INFORMATION CONFIGURATION */}
      {activeTab === "hotel" && (
        <form onSubmit={handleSaveHotelInfo} className="rounded-2xl border border-border bg-card p-6 shadow-xs max-w-3xl space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold text-foreground">Hotel Brand & Property Details</h2>
            <p className="text-xs text-muted-foreground">
              These details appear in guest invoices, confirmation emails, booking receipts, and the website footer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Hotel Name
              </label>
              <input
                type="text"
                required
                value={hotelInfo.hotelName}
                onChange={(e) => setHotelInfo({ ...hotelInfo, hotelName: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tagline / Brand Statement
              </label>
              <input
                type="text"
                value={hotelInfo.tagline}
                onChange={(e) => setHotelInfo({ ...hotelInfo, tagline: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Property Address
              </label>
              <input
                type="text"
                value={hotelInfo.address}
                onChange={(e) => setHotelInfo({ ...hotelInfo, address: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Concierge Phone
              </label>
              <input
                type="text"
                value={hotelInfo.phone}
                onChange={(e) => setHotelInfo({ ...hotelInfo, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={hotelInfo.email}
                onChange={(e) => setHotelInfo({ ...hotelInfo, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Check-in Time (24h)
              </label>
              <input
                type="text"
                value={hotelInfo.checkInTime}
                onChange={(e) => setHotelInfo({ ...hotelInfo, checkInTime: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Check-out Time (24h)
              </label>
              <input
                type="text"
                value={hotelInfo.checkOutTime}
                onChange={(e) => setHotelInfo({ ...hotelInfo, checkOutTime: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={savingHotel}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {savingHotel ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Hotel Information
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Hero Image Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Hero Section Image"
        description="Are you sure you want to reset the hero section image to the default luxury hotel banner? The current custom Cloudinary image asset will be removed."
        confirmText="Reset Hero Image"
        isLoading={resettingHero}
        onConfirm={confirmResetHero}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
