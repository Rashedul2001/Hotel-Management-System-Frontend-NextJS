"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Plus,
  Eye,
  Sparkles,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
} from "lucide-react";
import {
  getGalleryImages,
  getGalleryCategories,
  createGalleryImage,
  deleteGalleryImage,
  type GalleryImageItem,
} from "@/lib/gallery-api";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { successToast, errorToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

const DEFAULT_CATEGORIES = [
  "All",
  "Rooms",
  "Dining",
  "Wellness",
  "Exterior",
  "Experiences",
];

export default function PMSGalleryPage() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Rooms");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview lightbox modal state
  const [previewImage, setPreviewImage] = useState<GalleryImageItem | null>(null);

  // Delete modal state
  const [imageToDelete, setImageToDelete] = useState<GalleryImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch pictures
  const loadGallery = async () => {
    try {
      setLoading(true);
      const [fetchedImages, fetchedCategories] = await Promise.all([
        getGalleryImages(),
        getGalleryCategories(),
      ]);
      setImages(fetchedImages);

      // Merge categories
      const catSet = new Set(DEFAULT_CATEGORIES);
      fetchedCategories.forEach((c) => catSet.add(c));
      setCategories(Array.from(catSet));
    } catch (err: any) {
      errorToast("Gallery Error", err.message || "Failed to load gallery pictures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  // Filtered images
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const matchesCategory =
        selectedCategory === "All" ||
        img.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !searchQuery.trim() ||
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [images, selectedCategory, searchQuery]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      errorToast("Invalid Format", "Please select a JPEG, PNG, or WebP image file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      errorToast("File Too Large", "Image size cannot exceed 15 MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setManualUrl("");
    setTitle("");
    setCategory("Rooms");
    setDescription("");
    setIsFeatured(false);
    setDisplayOrder(0);
    setSubmitting(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      errorToast("Title Required", "Please enter a title for the picture.");
      return;
    }

    if (uploadMode === "file" && !selectedFile) {
      errorToast("Image Required", "Please choose an image file to upload.");
      return;
    }

    if (uploadMode === "url" && !manualUrl.trim()) {
      errorToast("URL Required", "Please enter an image URL.");
      return;
    }

    try {
      setSubmitting(true);
      const newImage = await createGalleryImage({
        file: uploadMode === "file" ? selectedFile : null,
        imageUrl: uploadMode === "url" ? manualUrl.trim() : null,
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        featured: isFeatured,
        displayOrder: Number(displayOrder) || 0,
      });

      setImages((prev) => [newImage, ...prev]);
      successToast(
        "Picture Uploaded",
        `"${title}" was added to the hotel gallery and Cloudinary successfully.`
      );
      handleCloseAddModal();
    } catch (err: any) {
      errorToast("Upload Failed", err.message || "Failed to add picture.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    try {
      setIsDeleting(true);
      await deleteGalleryImage(imageToDelete.id);
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      successToast(
        "Picture Deleted",
        `"${imageToDelete.title}" has been deleted from the gallery and Cloudinary.`
      );
      setImageToDelete(null);
    } catch (err: any) {
      errorToast("Delete Failed", err.message || "Failed to delete picture.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const totalCount = images.length;
  const featuredCount = images.filter((img) => img.featured).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            <ImageIcon className="h-4 w-4" /> Hotel Media & Assets
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Gallery Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Upload, categorize, and manage high-resolution photographs showcased across
            the guest-facing gallery and landing pages. Managed images are stored securely in Cloudinary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGallery}
            disabled={loading}
            className="gap-1.5 text-xs rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 text-xs font-bold rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Picture
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Pictures
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Featured in Gallery
          </p>
          <p className="text-2xl font-extrabold text-primary mt-1">{featuredCount}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Categories
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-1">
            {categories.filter((c) => c !== "All").length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Storage Provider
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Cloudinary CDN
          </p>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Images */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs animate-pulse"
            >
              <div className="h-44 bg-muted" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center bg-card/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <ImageIcon className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No gallery pictures found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No pictures match your search query "${searchQuery}".`
              : selectedCategory !== "All"
              ? `No pictures found in category "${selectedCategory}".`
              : "Start by uploading pictures for the hotel gallery."}
          </p>
          <div className="mt-5">
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" /> Upload Picture
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={img.imageUrl || img.src}
                  alt={img.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                    {img.category}
                  </span>

                  {img.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md px-2 py-0.5 text-[10px] font-bold shadow-xs">
                      <Sparkles className="h-3 w-3" /> Featured
                    </span>
                  )}
                </div>

                {/* Quick Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md hover:scale-110 transition-transform"
                    title="View Full Size"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageToDelete(img)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:scale-110 transition-transform"
                    title="Delete Picture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col flex-1">
                <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {img.title}
                </h3>
                {img.description && (
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {img.description}
                  </p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50 text-[10px] text-muted-foreground">
                  <span>
                    {img.publicId ? "Cloudinary Asset" : "External Link"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageToDelete(img)}
                    className="text-destructive hover:underline font-medium flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Picture Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Add Gallery Picture
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload to Cloudinary or specify an image URL.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={submitting}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode switch */}
            <div className="flex rounded-xl bg-muted/60 p-1 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  uploadMode === "file"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File (Cloudinary)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("url")}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  uploadMode === "url"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Image URL
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* File Upload Box */}
              {uploadMode === "file" ? (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Select Picture File <span className="text-destructive">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-muted">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-destructive transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 p-6 text-center transition-all"
                    >
                      <UploadCloud className="mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="text-xs font-bold text-foreground">
                        Click to browse image
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Supports JPEG, PNG, and WebP (up to 15 MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Direct Image URL <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Picture Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Presidential Suite"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Rooms">Rooms</option>
                    <option value="Dining">Dining</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Experiences">Experiences</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Display Order (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Description / Caption */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Caption / Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="A spacious retreat with panoramic sea views and refined bespoke details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Featured Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-border p-3 hover:bg-muted/30 transition">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Prominent Gallery Tile (Featured)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Showcases this picture in large 2x2 featured grids on the guest gallery.
                  </p>
                </div>
              </label>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseAddModal}
                  disabled={submitting}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      Save Picture
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Full Size Modal */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden bg-card border border-border shadow-2xl"
          >
            <div className="relative aspect-video w-full bg-black">
              <Image
                src={previewImage.imageUrl || previewImage.src}
                alt={previewImage.title}
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 rounded-full bg-black/70 p-2 text-white hover:bg-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {previewImage.category}
                </span>
                <h3 className="text-base font-bold text-foreground mt-1">
                  {previewImage.title}
                </h3>
                {previewImage.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {previewImage.description}
                  </p>
                )}
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const toDelete = previewImage;
                  setPreviewImage(null);
                  setImageToDelete(toDelete);
                }}
                className="rounded-xl text-xs gap-1.5 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting */}
      <ConfirmModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Gallery Picture"
        description={
          imageToDelete
            ? `Are you sure you want to permanently delete "${imageToDelete.title}"? This picture will be removed from Cloudinary and will no longer appear on the guest gallery.`
            : "Are you sure you want to delete this picture?"
        }
        confirmText="Delete Picture"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
