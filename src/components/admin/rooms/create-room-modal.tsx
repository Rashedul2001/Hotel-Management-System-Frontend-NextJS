"use client";

import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BedDouble,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRoomAmenity, getRoomAmenities } from "@/lib/admin-rooms-api";
import type { RoomAmenity, RoomStatus } from "@/types/room";
import { BED_TYPES, ROOM_CATEGORIES } from "./room-constants";

export interface ExistingImage {
  id: number;
  url: string;
}

export type RoomFormValues = {
  id?: string;
  roomNumber: number | string;
  name: string;
  category: string;
  floor: number;
  status: RoomStatus;
  price: number;
  capacity: number;
  bedCount: number;
  bedType: (typeof BED_TYPES)[number];
  size: number;
  description: string;
  amenities: string[];
  amenityIds: number[];
  existingImageIds: number[];
  images: File[];
};

export type RoomInitialData = {
  id?: string;
  roomNumber?: number | string;
  name?: string;
  category?: string;
  floor?: number;
  status?: RoomStatus;
  price?: number;
  capacity?: number;
  bedCount?: number;
  bedType?: (typeof BED_TYPES)[number];
  size?: number;
  description?: string;
  amenities?: string[];
  amenityIds?: number[];
  existingImages?: ExistingImage[];
};

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void> | void;
  initialData?: RoomInitialData | null;
  title?: string;
  submitLabel?: string;
}

type NewImagePreview = {
  id: string;
  file: File;
  url: string;
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB matching backend MaxRoomImageSize
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const defaultEmptyValues: RoomFormValues = {
  roomNumber: "",
  name: "",
  category: "Standard",
  floor: 1,
  status: "Available",
  price: 100,
  capacity: 2,
  bedCount: 1,
  bedType: "Queen",
  size: 30,
  description: "",
  amenities: [],
  amenityIds: [],
  existingImageIds: [],
  images: [],
};

export default function CreateRoomModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  submitLabel,
}: CreateRoomModalProps) {
  const isEditing = Boolean(initialData?.id);
  const modalTitle = title ?? (isEditing ? "Edit Room" : "Create New Room");
  const modalSubmitLabel = submitLabel ?? (isEditing ? "Save Changes" : "Create Room");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [newPreviews, setNewPreviews] = useState<NewImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<RoomAmenity[]>([]);
  const [isAddingAmenity, setIsAddingAmenity] = useState(false);

  const computedDefaults = useMemo<RoomFormValues>(() => {
    if (!initialData) {
      return defaultEmptyValues;
    }

    return {
      id: initialData.id,
      roomNumber: initialData.roomNumber ?? "",
      name: initialData.name ?? "",
      category: initialData.category ?? "Standard",
      floor: initialData.floor ?? 1,
      status: initialData.status ?? "Available",
      price: initialData.price ?? 100,
      capacity: initialData.capacity ?? 2,
      bedCount: initialData.bedCount ?? 1,
      bedType: initialData.bedType ?? "Queen",
      size: initialData.size ?? 30,
      description: initialData.description ?? "",
      amenities: initialData.amenities ?? [],
      amenityIds: initialData.amenityIds ?? [],
      existingImageIds: (initialData.existingImages ?? []).map((img) => img.id),
      images: [],
    };
  }, [initialData]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormValues>({
    defaultValues: computedDefaults,
    mode: "onBlur",
  });

  const amenities = watch("amenities") || [];
  const amenityIds = watch("amenityIds") || [];
  const capacity = watch("capacity");

  // Reset form whenever modal opens with new data
  useEffect(() => {
    if (!open) return;

    reset(computedDefaults);
    setExistingImages(initialData?.existingImages ?? []);
    setAmenityInput("");
    setImageError("");
    setSubmitError("");

    newPreviews.forEach((preview) => {
      URL.revokeObjectURL(preview.url);
    });
    setNewPreviews([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, computedDefaults]);

  // Load backend amenities
  useEffect(() => {
    if (!open) return;

    getRoomAmenities()
      .then(setAvailableAmenities)
      .catch((err) => {
        setSubmitError(
          err instanceof Error ? err.message : "Unable to load room amenities.",
        );
      });
  }, [open]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      newPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [newPreviews]);

  // Prevent background scroll
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isSubmitting, onClose]);

  // Add new photos
  const addImages = useCallback(
    (files: File[]) => {
      setImageError("");

      const validMimeFiles = files.filter((f) =>
        ALLOWED_MIME_TYPES.includes(f.type.toLowerCase()),
      );

      if (validMimeFiles.length !== files.length) {
        setImageError("Only JPEG, PNG, and WebP images are allowed.");
      }

      const oversized = validMimeFiles.filter((f) => f.size > MAX_IMAGE_SIZE);
      if (oversized.length > 0) {
        setImageError("Each photo must be 10 MB or smaller.");
      }

      const suitable = validMimeFiles.filter((f) => f.size <= MAX_IMAGE_SIZE);
      const remainingSlots = MAX_IMAGES - existingImages.length - newPreviews.length;

      if (remainingSlots <= 0) {
        setImageError(`You can have up to ${MAX_IMAGES} photos in total.`);
        return;
      }

      const filesToAdd = suitable.slice(0, remainingSlots);
      if (suitable.length > remainingSlots) {
        setImageError(`You can have up to ${MAX_IMAGES} photos in total.`);
      }

      const freshPreviews: NewImagePreview[] = filesToAdd.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }));

      const nextPreviews = [...newPreviews, ...freshPreviews];
      setNewPreviews(nextPreviews);

      setValue(
        "images",
        nextPreviews.map((p) => p.file),
        { shouldDirty: true },
      );
    },
    [existingImages.length, newPreviews, setValue],
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addImages(files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    addImages(Array.from(e.dataTransfer.files));
  };

  // Delete a newly added photo
  const removeNewImage = (id: string) => {
    setNewPreviews((current) => {
      const target = current.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter((p) => p.id !== id);
      setValue(
        "images",
        next.map((p) => p.file),
        { shouldDirty: true },
      );
      return next;
    });
  };

  // Delete an existing photo individually (for edit mode)
  const removeExistingImage = (imageId: number) => {
    setExistingImages((current) => {
      const updated = current.filter((img) => img.id !== imageId);
      setValue(
        "existingImageIds",
        updated.map((img) => img.id),
        { shouldDirty: true },
      );
      return updated;
    });
  };

  // Amenities handling
  const addAmenity = async (value?: string) => {
    const trimmed = (value ?? amenityInput).trim();
    if (!trimmed) return;

    const alreadySelected = amenities.some(
      (a) => a.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadySelected) {
      setAmenityInput("");
      return;
    }

    setIsAddingAmenity(true);
    setSubmitError("");

    try {
      const existing = availableAmenities.find(
        (a) => a.name.toLowerCase() === trimmed.toLowerCase(),
      );
      const amenity = existing ?? (await createRoomAmenity(trimmed));

      if (!existing) {
        setAvailableAmenities((curr) => [...curr, amenity]);
      }

      setValue("amenities", [...amenities, amenity.name], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("amenityIds", [...amenityIds, amenity.id], {
        shouldDirty: true,
      });
      setAmenityInput("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to add amenity.",
      );
    } finally {
      setIsAddingAmenity(false);
    }
  };

  const removeAmenity = (nameToRemove: string) => {
    const index = amenities.indexOf(nameToRemove);
    const removedId = index >= 0 ? amenityIds[index] : undefined;

    setValue(
      "amenities",
      amenities.filter((a) => a !== nameToRemove),
      { shouldDirty: true },
    );

    if (removedId !== undefined) {
      setValue(
        "amenityIds",
        amenityIds.filter((id) => id !== removedId),
        { shouldDirty: true },
      );
    }
  };

  const handleAmenityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void addAmenity();
    }
  };

  // Submit Handler
  const submitForm = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSubmit({
        ...values,
        existingImageIds: existingImages.map((img) => img.id),
        images: newPreviews.map((p) => p.file),
      });

      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to save the room.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex flex-col bg-card shadow-2xl border border-border rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden text-card-foreground"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-border shrink-0 bg-card">
          <div>
            <h2 className="font-semibold text-lg sm:text-xl tracking-tight text-foreground">
              {modalTitle}
            </h2>
            <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">
              {isEditing
                ? "Update room information, configure amenities, and manage photos."
                : "Add room details, configure amenities, set pricing and upload photos."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="flex justify-center items-center hover:bg-muted disabled:opacity-50 rounded-lg w-9 h-9 text-muted-foreground hover:text-foreground transition disabled:pointer-events-none shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(submitForm)}
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <div className="space-y-7 p-4 sm:p-6">
            {/* Basic Info Fields */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              {/* Room Number */}
              <Field
                label="Room Number"
                required
                error={errors.roomNumber?.message}
              >
                <input
                  {...register("roomNumber", {
                    required: "Room number is required.",
                    pattern: {
                      value: /^[1-9]\d*$/,
                      message: "Room number must be a positive whole number (e.g. 101).",
                    },
                  })}
                  type="number"
                  min="1"
                  step="1"
                  className="input"
                  placeholder="e.g. 204"
                />
              </Field>

              {/* Room Name */}
              <Field label="Room Name" required error={errors.name?.message}>
                <input
                  {...register("name", {
                    required: "Room name is required.",
                    minLength: {
                      value: 2,
                      message: "Room name must contain at least 2 characters.",
                    },
                    maxLength: {
                      value: 120,
                      message: "Room name cannot exceed 120 characters.",
                    },
                  })}
                  className="input"
                  placeholder="e.g. Deluxe Ocean View Suite"
                />
              </Field>

              {/* Category */}
              <Field label="Category" required error={errors.category?.message}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Please select a room category." }}
                  render={({ field }) => (
                    <Select
                      value={field.value || "Standard"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Floor */}
              <Field label="Floor" required error={errors.floor?.message}>
                <input
                  {...register("floor", {
                    valueAsNumber: true,
                    required: "Floor is required.",
                    min: { value: 1, message: "Floor must be between 1 and 200." },
                    max: { value: 200, message: "Floor cannot exceed 200." },
                  })}
                  type="number"
                  min="1"
                  max="200"
                  step="1"
                  className="input"
                  placeholder="2"
                />
              </Field>

              {/* Status */}
              <Field label="Status" required error={errors.status?.message}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "Available"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Occupied">Occupied</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Price / Night */}
              <Field
                label="Price / Night"
                required
                error={errors.price?.message}
              >
                <div className="relative">
                  <span className="top-1/2 left-3 absolute font-medium text-muted-foreground text-sm -translate-y-1/2 pointer-events-none">
                    $
                  </span>
                  <input
                    {...register("price", {
                      valueAsNumber: true,
                      required: "Price is required.",
                      min: {
                        value: 0.01,
                        message: "Price must be at least $0.01.",
                      },
                      max: {
                        value: 1000000,
                        message: "Price cannot exceed $1,000,000.",
                      },
                    })}
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="pl-6! input"
                    placeholder="150"
                  />
                </div>
              </Field>

              {/* Capacity */}
              <Field
                label="Maximum Guests"
                required
                error={errors.capacity?.message}
              >
                <div className="relative">
                  <Users className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
                  <input
                    {...register("capacity", {
                      valueAsNumber: true,
                      required: "Maximum guests is required.",
                      min: { value: 1, message: "At least 1 guest is required." },
                      max: { value: 20, message: "Maximum capacity is 20." },
                    })}
                    type="number"
                    min="1"
                    max="20"
                    step="1"
                    className="pl-8! input"
                    placeholder="2"
                  />
                </div>
              </Field>

              {/* Room Size */}
              <Field label="Room Size (m²)" required error={errors.size?.message}>
                <input
                  {...register("size", {
                    valueAsNumber: true,
                    required: "Room size is required.",
                    min: { value: 1, message: "Size must be at least 1 m²." },
                    max: { value: 2000, message: "Size cannot exceed 2000 m²." },
                  })}
                  type="number"
                  min="1"
                  max="2000"
                  step="1"
                  className="input"
                  placeholder="35"
                />
              </Field>

              {/* Beds */}
              <Field
                label="Bed Count"
                required
                error={errors.bedCount?.message}
              >
                <div className="relative">
                  <BedDouble className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
                  <input
                    {...register("bedCount", {
                      valueAsNumber: true,
                      required: "Bed count is required.",
                      min: { value: 1, message: "At least one bed is required." },
                      max: { value: 10, message: "Maximum bed count is 10." },
                    })}
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    className="pl-8! input"
                    placeholder="1"
                  />
                </div>
              </Field>

              {/* Bed Type */}
              <Field label="Bed Type" required error={errors.bedType?.message}>
                <Controller
                  name="bedType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "Queen"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            {/* Description */}
            <section className="pt-6 border-t border-border">
              <SectionHeading
                title="Room Description"
                description="Give guests a clear overview of the room, atmosphere, and highlights."
              />
              <div className="mt-3">
                <textarea
                  {...register("description", {
                    required: "Room description is required.",
                    minLength: {
                      value: 20,
                      message: "Description should contain at least 20 characters.",
                    },
                    maxLength: {
                      value: 4000,
                      message: "Description cannot exceed 4000 characters.",
                    },
                  })}
                  rows={4}
                  className="min-h-28 resize-y input"
                  placeholder="Describe the room, its atmosphere, furnishings and views..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-destructive text-xs">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </section>

            {/* Amenities Section */}
            <section className="pt-6 border-t border-border">
              <SectionHeading
                title="Amenities"
                description="Add included amenities. Click suggestions below or type a custom amenity."
              />

              <div className="mt-3">
                <div className="flex sm:flex-row flex-col gap-2">
                  <input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={handleAmenityKeyDown}
                    className="flex-1 input"
                    placeholder="e.g. Balcony, Mini Bar, Ocean View"
                  />

                  <button
                    type="button"
                    onClick={() => void addAmenity()}
                    disabled={isAddingAmenity || !amenityInput.trim()}
                    className="inline-flex justify-center items-center gap-2 bg-secondary hover:bg-secondary/80 disabled:opacity-50 px-4 rounded-xl min-h-11 font-medium text-secondary-foreground text-sm transition"
                  >
                    {isAddingAmenity ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isAddingAmenity ? "Adding..." : "Add"}
                  </button>
                </div>

                {/* Quick amenity suggestions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {availableAmenities
                    .filter(
                      (item) =>
                        !amenities.some(
                          (selected) =>
                            selected.toLowerCase() === item.name.toLowerCase(),
                        ),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void addAmenity(item.name)}
                        disabled={isAddingAmenity}
                        className="bg-background px-3 py-1.5 border border-border hover:border-primary rounded-full text-muted-foreground hover:text-primary text-xs transition"
                      >
                        + {item.name}
                      </button>
                    ))}
                </div>

                {/* Selected Amenities Badges */}
                {amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {amenities.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full font-medium text-primary text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {item}
                        <button
                          type="button"
                          onClick={() => removeAmenity(item)}
                          className="hover:bg-primary/20 ml-0.5 p-0.5 rounded-full transition"
                          aria-label={`Remove ${item}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-muted-foreground text-xs">
                    No amenities selected yet.
                  </p>
                )}
              </div>
            </section>

            {/* Photos Section */}
            <section className="pt-6 border-t border-border">
              <SectionHeading
                title="Room Photos"
                description={`Upload up to ${MAX_IMAGES} photos (JPEG, PNG, or WebP). Maximum 10 MB per photo.`}
              />

              <div className="mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-center items-center bg-primary/10 mx-auto rounded-xl w-12 h-12 text-primary">
                    <ImagePlus className="w-6 h-6" />
                  </div>

                  <h3 className="mt-3 font-semibold text-sm">Upload room photos</h3>
                  <p className="mx-auto mt-1 max-w-md text-muted-foreground text-xs leading-5">
                    Drag and drop photos here, or select files from your computer.
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      existingImages.length + newPreviews.length >= MAX_IMAGES
                    }
                    className="inline-flex justify-center items-center gap-2 bg-card disabled:opacity-50 mt-4 px-4 border border-border hover:border-primary rounded-xl min-h-10 font-medium hover:text-primary text-sm transition disabled:pointer-events-none"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Images
                  </button>

                  <p className="mt-3 text-[11px] text-muted-foreground">
                    JPG, PNG, or WebP · Up to 10 MB each · {existingImages.length + newPreviews.length} / {MAX_IMAGES} uploaded
                  </p>
                </div>

                {imageError && (
                  <p className="mt-2 text-destructive text-xs">{imageError}</p>
                )}

                {/* Existing Photos Grid (in Edit Mode) */}
                {existingImages.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="font-medium text-muted-foreground text-xs">
                        Existing Photos ({existingImages.length})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Click the trash button on any photo to remove it from the room.
                      </p>
                    </div>

                    <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                      {existingImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative bg-muted border border-border rounded-xl aspect-4/3 overflow-hidden shadow-xs"
                        >
                          <Image
                            src={img.url}
                            alt={`Existing room photo ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="top-2 right-2 absolute flex justify-center items-center bg-black/70 hover:bg-destructive backdrop-blur-sm rounded-lg w-7 h-7 text-white transition shadow-sm"
                            title="Delete this image"
                            aria-label={`Remove photo ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Photos Grid */}
                {newPreviews.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 font-medium text-muted-foreground text-xs">
                      New Photos to Upload ({newPreviews.length})
                    </p>

                    <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                      {newPreviews.map((preview, idx) => (
                        <div
                          key={preview.id}
                          className="group relative bg-muted border border-border rounded-xl aspect-4/3 overflow-hidden shadow-xs"
                        >
                          <Image
                            src={preview.url}
                            alt={`New room photo ${idx + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          <span className="top-2 left-2 absolute bg-primary px-1.5 py-0.5 rounded-md font-semibold text-[10px] text-primary-foreground shadow-xs">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewImage(preview.id)}
                            className="top-2 right-2 absolute flex justify-center items-center bg-black/70 hover:bg-destructive backdrop-blur-sm rounded-lg w-7 h-7 text-white transition shadow-sm"
                            title="Remove this photo"
                            aria-label={`Remove new photo ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Summary Preview */}
            <section className="bg-background p-4 border border-border rounded-2xl">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="font-semibold text-sm">Room Summary</p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    Quick overview of the configuration being saved.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full font-medium text-primary text-xs">
                  <Users className="w-3.5 h-3.5" />
                  Up to {capacity || 0} guests
                </div>
              </div>

              <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 mt-4 text-sm">
                <SummaryItem
                  label="Room"
                  value={
                    watch("name")
                      ? `Room ${watch("roomNumber") || "?"} - ${watch("name")}`
                      : "Not specified"
                  }
                />
                <SummaryItem
                  label="Category"
                  value={watch("category") || "Not specified"}
                />
                <SummaryItem
                  label="Price"
                  value={`$${(Number(watch("price")) || 0).toFixed(2)} / night`}
                />
                <SummaryItem
                  label="Photos"
                  value={`${existingImages.length + newPreviews.length} total`}
                />
              </div>
            </section>
          </div>

          {/* Footer Bar */}
          <div className="bottom-0 sticky flex sm:flex-row flex-col-reverse sm:justify-end sm:items-center gap-3 bg-card/95 backdrop-blur p-4 sm:px-6 border-t border-border shrink-0">
            {submitError && (
              <p
                className="mr-auto text-destructive text-xs font-medium max-w-xl"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="hover:bg-muted disabled:opacity-50 px-5 border border-border rounded-xl min-h-11 font-medium text-sm transition disabled:pointer-events-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 shadow-sm px-5 rounded-xl min-h-11 font-semibold text-primary-foreground text-sm transition disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {modalSubmitLabel}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-sm sm:text-base text-foreground">{title}</h3>
      <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm leading-5">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5 font-medium text-xs sm:text-sm text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1.5 text-destructive text-xs">{error}</p>}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3 border border-border rounded-xl min-w-0">
      <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 font-semibold text-xs sm:text-sm truncate text-foreground">
        {value}
      </p>
    </div>
  );
}

// Named alias export for flexibility
export { CreateRoomModal };
