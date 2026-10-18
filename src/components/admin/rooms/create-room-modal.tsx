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
import { useForm } from "react-hook-form";
import Image from "next/image";

export type RoomFormValues = {
    id?: string;
    roomNumber: string;
    name: string;
    category: string;
    floor: number;
    status: "Available" | "Occupied" | "Cleaning" | "Maintenance" | "Blocked";
    price: number;
    maxGuests: number;
    beds: number;
    bedType: "Single" | "Twin" | "Double" | "Queen" | "King";
    size: number;
    description: string;
    amenities: string[];
    images: File[];
};

export type RoomInitialData = Omit<RoomFormValues, "images"> & {
    id?: string;
    images?: string[];
};

type CreateRoomModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: RoomFormValues) => Promise<void> | void;
    initialData?: RoomInitialData | null;
    title?: string;
    submitLabel?: string;
    categories?: string[];
};

type ImagePreview = {
    id: string;
    file: File;
    url: string;
};

const DEFAULT_CATEGORIES = [
    "Standard",
    "Deluxe",
    "Premium",
    "Suite",
    "Family",
    "Executive",
];

const DEFAULT_AMENITIES = [
    "Free Wi-Fi",
    "Breakfast Included",
    "Air Conditioning",
    "City View",
    "Mini Bar",
    "Room Service",
    "Smart TV",
    "Work Desk",
];

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const emptyValues: RoomFormValues = {
    roomNumber: "",
    name: "",
    category: "",
    floor: 1,
    status: "Available",
    price: 0,
    maxGuests: 1,
    beds: 1,
    bedType: "Queen",
    size: 30,
    description: "",
    amenities: [],
    images: [],
};

export default function CreateRoomModal({
    open,
    onClose,
    onSubmit,
    initialData,
    title = "Create New Room",
    submitLabel = "Create Room",
    categories = DEFAULT_CATEGORIES,
}: CreateRoomModalProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [previews, setPreviews] = useState<ImagePreview[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [amenityInput, setAmenityInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [imageError, setImageError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const defaultValues = useMemo<RoomFormValues>(() => {
        if (!initialData) {
            return emptyValues;
        }

        return {
            id: initialData.id,
            roomNumber: initialData.roomNumber ?? "",
            name: initialData.name ?? "",
            category: initialData.category ?? "",
            floor: initialData.floor ?? 1,
            status: initialData.status ?? "Available",
            price: initialData.price ?? 0,
            maxGuests: initialData.maxGuests ?? 1,
            beds: initialData.beds ?? 1,
            bedType: initialData.bedType ?? "Queen",
            size: initialData.size ?? 30,
            description: initialData.description ?? "",
            amenities: initialData.amenities ?? [],
            images: [],
        };
    }, [initialData]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RoomFormValues>({
        defaultValues,
        mode: "onBlur",
    });

    const amenities = watch("amenities");
    const maxGuests = watch("maxGuests");

    /*
     * Reset the form whenever the modal is opened with new data.
     * This makes the same component usable for both create and edit flows.
     */
    useEffect(() => {
        if (!open) return;

        reset(defaultValues);
        setExistingImages(initialData?.images ?? []);
        setAmenityInput("");
        setImageError("");
        setSubmitError("");

        previews.forEach((preview) => {
            URL.revokeObjectURL(preview.url);
        });

        setPreviews([]);
    }, [open, defaultValues, initialData?.images]);

    /*
     * Clean up object URLs when the component unmounts.
     */
    useEffect(() => {
        return () => {
            previews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [previews]);

    /*
     * Prevent the page behind the modal from scrolling.
     */
    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [open]);

    /*
     * Escape closes the modal.
     */
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, isSubmitting, onClose]);

    const addImages = useCallback(
        (files: File[]) => {
            setImageError("");

            const imageFiles = files.filter((file) =>
                file.type.startsWith("image/")
            );

            if (imageFiles.length !== files.length) {
                setImageError("Only image files are allowed.");
            }

            const oversizedFiles = imageFiles.filter(
                (file) => file.size > MAX_IMAGE_SIZE
            );

            if (oversizedFiles.length > 0) {
                setImageError("Each image must be smaller than 8 MB.");
            }

            const validFiles = imageFiles.filter(
                (file) => file.size <= MAX_IMAGE_SIZE
            );

            const remainingSlots =
                MAX_IMAGES - existingImages.length - previews.length;

            if (remainingSlots <= 0) {
                setImageError(`You can upload up to ${MAX_IMAGES} images.`);
                return;
            }

            const filesToAdd = validFiles.slice(0, remainingSlots);

            if (validFiles.length > remainingSlots) {
                setImageError(`You can upload up to ${MAX_IMAGES} images.`);
            }

            const newPreviews: ImagePreview[] = filesToAdd.map((file) => ({
                id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                file,
                url: URL.createObjectURL(file),
            }));

            setPreviews((current) => [...current, ...newPreviews]);

            setValue(
                "images",
                [...previews, ...newPreviews].map((preview) => preview.file),
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            );
        },
        [existingImages.length, previews, setValue]
    );

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        addImages(files);

        // Allows selecting the same image again after removing it.
        event.target.value = "";
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (isSubmitting) return;

        const files = Array.from(event.dataTransfer.files);
        addImages(files);
    };

    const removeNewImage = (id: string) => {
        setPreviews((current) => {
            const target = current.find((preview) => preview.id === id);

            if (target) {
                URL.revokeObjectURL(target.url);
            }

            const next = current.filter((preview) => preview.id !== id);

            setValue(
                "images",
                next.map((preview) => preview.file),
                {
                    shouldDirty: true,
                }
            );

            return next;
        });
    };

    const removeExistingImage = (url: string) => {
        setExistingImages((current) =>
            current.filter((image) => image !== url)
        );
    };

    const addAmenity = (value?: string) => {
        const trimmedValue = (value ?? amenityInput).trim();

        if (!trimmedValue) return;

        const alreadyExists = amenities.some(
            (amenity) => amenity.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (alreadyExists) {
            setAmenityInput("");
            return;
        }

        setValue("amenities", [...amenities, trimmedValue], {
            shouldDirty: true,
            shouldValidate: true,
        });

        setAmenityInput("");
    };

    const removeAmenity = (amenityToRemove: string) => {
        setValue(
            "amenities",
            amenities.filter((amenity) => amenity !== amenityToRemove),
            {
                shouldDirty: true,
            }
        );
    };

    const handleAmenityKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addAmenity();
        }
    };

    const submitForm = async (values: RoomFormValues) => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            await onSubmit({
                ...values,
                images: previews.map((preview) => preview.file),
            });

            onClose();
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : "Unable to save the room."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="z-100 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-3 sm:p-6"
            onMouseDown={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
        >
            <div
                className="flex flex-col bg-card shadow-2xl border border-border rounded-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden text-card-foreground"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center bg-card px-4 sm:px-6 py-4 border-border border-b shrink-0">
                    <div>
                        <h2
                            id="create-room-title"
                            className="font-semibold text-lg sm:text-xl tracking-tight"
                        >
                            {title}
                        </h2>

                        <p className="mt-1 text-muted-foreground text-xs sm:text-sm">
                            Add room details, amenities, pricing and photos.
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

                {/* Form */}
                <form
                    onSubmit={handleSubmit(submitForm)}
                    className="flex-1 min-h-0 overflow-y-auto"
                >
                    <div className="space-y-7 p-4 sm:p-6">
                        {/* Basic Information */}
                        <section>
                            <SectionHeading
                                title="Basic Information"
                                description="Define how this room will appear in your hotel inventory."
                            />

                            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mt-4">
                                <Field
                                    label="Room Number"
                                    required
                                    error={errors.roomNumber?.message}
                                >
                                    <input
                                        {...register("roomNumber", {
                                            required: "Room number is required.",
                                        })}
                                        className="input"
                                        placeholder="e.g. 204"
                                    />
                                </Field>

                                <Field
                                    label="Room Name"
                                    required
                                    error={errors.name?.message}
                                >
                                    <input
                                        {...register("name", {
                                            required: "Room name is required.",
                                            minLength: {
                                                value: 2,
                                                message: "Room name must contain at least 2 characters.",
                                            },
                                        })}
                                        className="input"
                                        placeholder="e.g. Family Deluxe Room"
                                    />
                                </Field>

                                <Field
                                    label="Category"
                                    required
                                    error={errors.category?.message}
                                >
                                    <select
                                        {...register("category", {
                                            required: "Please select a room category.",
                                        })}
                                        className="input"
                                    >
                                        <option value="">Select category</option>

                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Floor" required error={errors.floor?.message}>
                                    <input
                                        {...register("floor", {
                                            valueAsNumber: true,
                                            required: "Floor is required.",
                                            min: { value: 1, message: "Floor must be at least 1." },
                                        })}
                                        type="number"
                                        min="1"
                                        className="input"
                                        placeholder="2"
                                    />
                                </Field>

                                <Field label="Status" required error={errors.status?.message}>
                                    <select {...register("status")} className="input">
                                        <option value="Available">Available</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>
                                </Field>

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
                                                    value: 0,
                                                    message: "Price cannot be negative.",
                                                },
                                            })}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="pl-8 input"
                                            placeholder="230"
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label="Maximum Guests"
                                    required
                                    error={errors.maxGuests?.message}
                                >
                                    <div className="relative">
                                        <Users className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />

                                        <input
                                            {...register("maxGuests", {
                                                valueAsNumber: true,
                                                required: "Maximum guests is required.",
                                                min: {
                                                    value: 1,
                                                    message: "At least 1 guest is required.",
                                                },
                                            })}
                                            type="number"
                                            min="1"
                                            className="pl-10 input"
                                            placeholder="4"
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label="Room Size"
                                    required
                                    error={errors.size?.message}
                                >
                                    <input
                                        {...register("size", {
                                            valueAsNumber: true,
                                            required: "Room size is required.",
                                            min: { value: 1, message: "Room size must be greater than zero." },
                                        })}
                                        type="number"
                                        min="1"
                                        className="input"
                                        placeholder="30"
                                    />
                                </Field>

                                <Field
                                    label="Beds"
                                    required
                                    error={errors.beds?.message}
                                    className="md:col-span-2"
                                >
                                    <div className="relative">
                                        <BedDouble className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />

                                        <input
                                                {...register("beds", {
                                                    valueAsNumber: true,
                                                    required: "Bed configuration is required.",
                                                    min: { value: 1, message: "At least one bed is required." },
                                                })}
                                                type="number"
                                                min="1"
                                            className="pl-10 input"
                                                placeholder="1"
                                            />
                                    </div>
                                </Field>

                                <Field label="Bed Type" required error={errors.bedType?.message}>
                                    <select {...register("bedType")} className="input">
                                            <option value="Single">Single</option>
                                            <option value="Twin">Twin</option>
                                            <option value="Double">Double</option>
                                            <option value="Queen">Queen</option>
                                            <option value="King">King</option>
                                    </select>
                                </Field>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="pt-7 border-border border-t">
                            <SectionHeading
                                title="Room Description"
                                description="Give guests a clear overview of the room."
                            />

                            <div className="mt-4">
                                <textarea
                                    {...register("description", {
                                        required: "Room description is required.",
                                        minLength: {
                                            value: 20,
                                            message:
                                                "Description should contain at least 20 characters.",
                                        },
                                    })}
                                    rows={5}
                                    className="min-h-32 resize-y input"
                                    placeholder="Describe the room, its atmosphere and what makes it comfortable..."
                                />

                                {errors.description && (
                                    <p className="mt-1.5 text-destructive text-xs">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Amenities */}
                        <section className="pt-7 border-border border-t">
                            <SectionHeading
                                title="Amenities"
                                description="Add everything included with this room."
                            />

                            <div className="mt-4">
                                <div className="flex sm:flex-row flex-col gap-2">
                                    <input
                                        value={amenityInput}
                                        onChange={(event) => setAmenityInput(event.target.value)}
                                        onKeyDown={handleAmenityKeyDown}
                                        className="flex-1 input"
                                        placeholder="e.g. Balcony"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => addAmenity()}
                                        className="inline-flex justify-center items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 rounded-xl min-h-11 font-medium text-secondary-foreground text-sm transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>

                                {/* Quick amenities */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {DEFAULT_AMENITIES.filter(
                                        (amenity) =>
                                            !amenities.some(
                                                (selected) =>
                                                    selected.toLowerCase() === amenity.toLowerCase()
                                            )
                                    ).map((amenity) => (
                                        <button
                                            key={amenity}
                                            type="button"
                                            onClick={() => addAmenity(amenity)}
                                            className="bg-background px-3 py-1.5 border border-border hover:border-primary rounded-full text-muted-foreground hover:text-primary text-xs transition"
                                        >
                                            + {amenity}
                                        </button>
                                    ))}
                                </div>

                                {/* Selected amenities */}
                                {amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {amenities.map((amenity) => (
                                            <span
                                                key={amenity}
                                                className="inline-flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full font-medium text-primary text-xs"
                                            >
                                                <Check className="w-3.5 h-3.5" />

                                                {amenity}

                                                <button
                                                    type="button"
                                                    onClick={() => removeAmenity(amenity)}
                                                    className="hover:bg-primary/15 ml-0.5 p-0.5 rounded-full transition"
                                                    aria-label={`Remove ${amenity}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {amenities.length === 0 && (
                                    <p className="mt-3 text-muted-foreground text-xs">
                                        No amenities selected yet.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Images */}
                        <section className="pt-7 border-border border-t">
                            <SectionHeading
                                title="Room Photos"
                                description={`Upload up to ${MAX_IMAGES} photos. Each image can be up to 8 MB.`}
                            />

                            <div className="mt-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div
                                    onDragEnter={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDrop={handleDrop}
                                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${isDragging
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-background hover:border-primary/50"
                                        }`}
                                >
                                    <div className="flex justify-center items-center bg-primary/10 mx-auto rounded-xl w-12 h-12 text-primary">
                                        <ImagePlus className="w-6 h-6" />
                                    </div>

                                    <h3 className="mt-3 font-semibold text-sm">
                                        Upload room photos
                                    </h3>

                                    <p className="mx-auto mt-1 max-w-md text-muted-foreground text-xs leading-5">
                                        Drag and drop your images here, or select multiple files
                                        from your device.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={
                                            existingImages.length + previews.length >= MAX_IMAGES
                                        }
                                        className="inline-flex justify-center items-center gap-2 bg-card disabled:opacity-50 mt-4 px-4 border border-border hover:border-primary rounded-xl min-h-10 font-medium hover:text-primary text-sm transition disabled:pointer-events-none"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Choose Images
                                    </button>

                                    <p className="mt-3 text-[11px] text-muted-foreground">
                                        JPG, PNG, WEBP or AVIF · Maximum 8 MB per image
                                    </p>
                                </div>

                                {imageError && (
                                    <p className="mt-2 text-destructive text-xs">
                                        {imageError}
                                    </p>
                                )}

                                {/* Existing images */}
                                {existingImages.length > 0 && (
                                    <div className="mt-5">
                                        <p className="mb-3 font-medium text-muted-foreground text-xs">
                                            Existing photos
                                        </p>

                                        <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                                            {existingImages.map((image, index) => (
                                                <ImagePreviewCard
                                                    key={`${image}-${index}`}
                                                    src={image}
                                                    alt={`Existing room photo ${index + 1}`}
                                                    onRemove={() => removeExistingImage(image)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New images */}
                                {previews.length > 0 && (
                                    <div className="mt-5">
                                        <p className="mb-3 font-medium text-muted-foreground text-xs">
                                            New photos
                                        </p>

                                        <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                                            {previews.map((preview, index) => (
                                                <ImagePreviewCard
                                                    key={preview.id}
                                                    src={preview.url}
                                                    alt={`New room photo ${index + 1}`}
                                                    onRemove={() => removeNewImage(preview.id)}
                                                    isNew
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Form preview */}
                        <section className="bg-background p-4 border border-border rounded-2xl">
                            <div className="flex flex-wrap justify-between items-center gap-3">
                                <div>
                                    <p className="font-semibold text-sm">Room summary</p>
                                    <p className="mt-0.5 text-muted-foreground text-xs">
                                        Quick overview of the information you entered.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full font-medium text-primary text-xs">
                                    <Users className="w-3.5 h-3.5" />
                                    Up to {maxGuests || 0} guests
                                </div>
                            </div>

                            <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 mt-4 text-sm">
                                <SummaryItem
                                    label="Room"
                                    value={watch("name") || "Not specified"}
                                />

                                <SummaryItem
                                    label="Category"
                                    value={watch("category") || "Not specified"}
                                />

                                <SummaryItem
                                    label="Price"
                                    value={
                                        Number.isFinite(watch("price"))
                                            ? `$${Number(watch("price") || 0).toFixed(2)}`
                                            : "$0.00"
                                    }
                                />

                                <SummaryItem
                                    label="Photos"
                                    value={`${existingImages.length + previews.length}`}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="bottom-0 sticky flex sm:flex-row flex-col-reverse sm:justify-end sm:items-center gap-3 bg-card/95 backdrop-blur p-4 sm:px-6 border-border border-t shrink-0">
                        {submitError && (
                            <p className="mr-auto text-destructive text-xs" role="alert">
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
                                    {submitLabel}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Supporting components                                                       */
/* -------------------------------------------------------------------------- */

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h3 className="font-semibold text-sm sm:text-base">{title}</h3>

            <p className="mt-1 text-muted-foreground text-xs sm:text-sm leading-5">
                {description}
            </p>
        </div>
    );
}

function Field({
    label,
    required,
    error,
    className = "",
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <label className="block mb-1.5 font-medium text-xs sm:text-sm">
                {label}

                {required && (
                    <span className="ml-1 text-destructive" aria-hidden="true">
                        *
                    </span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-destructive text-xs">
                    {error}
                </p>
            )}
        </div>
    );
}

function ImagePreviewCard({
    src,
    alt,
    onRemove,
    isNew = false,
}: {
    src: string;
    alt: string;
    onRemove: () => void;
    isNew?: boolean;
}) {
    return (
        <div className="group relative bg-muted border border-border rounded-xl aspect-4/3 overflow-hidden">
            <Image
                src={src}
                alt={alt}
                width={100}
                height={100}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />

            {isNew && (
                <span className="top-2 left-2 absolute bg-primary px-1.5 py-1 rounded-md font-medium text-[10px] text-primary-foreground">
                    New
                </span>
            )}

            <button
                type="button"
                onClick={onRemove}
                className="top-2 right-2 absolute flex justify-center items-center bg-black/65 hover:bg-destructive opacity-100 backdrop-blur-sm rounded-lg w-7 h-7 text-white transition"
                aria-label={`Remove ${alt}`}
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="bg-card p-3 border border-border rounded-xl min-w-0">
            <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                {label}
            </p>

            <p className="mt-1 font-semibold text-xs sm:text-sm truncate">
                {value}
            </p>
        </div>
    );
}
