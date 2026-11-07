import { Room } from "@/types/room";
import Image from "next/image";
import Link from "next/link";
import { FcTodoList } from "react-icons/fc";
import { FiArrowRight, FiGrid, FiHeart, FiUsers } from "react-icons/fi";

const RoomCard = ({ room, view }: { room: Room, view: "list" | "grid" }) => {

    return (


        <article
            className={`
          group overflow-hidden rounded-2xl border border-border
          bg-card shadow-sm transition-all duration-300
          hover:-translate-y-1 hover:shadow-xl
          ${view === "list"
                    ? "md:grid md:grid-cols-[280px_1fr]"
                    : ""
                }
        `}
        >
            {/* Image */}
            <div
                className={`
            relative overflow-hidden
            ${view === "list"
                        ? "h-64 md:h-full"
                        : "h-64 sm:h-72"
                    }
          `}
            >
                <Image
                    src={room.images.at(0)?.imageUrl || ""}
                    alt={`${room.name} at Velora Hotels`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes={
                        view === "list"
                            ? "(max-width: 768px) 100vw, 280px"
                            : "(max-width: 768px) 100vw, 50vw"
                    }
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

                {room.isFeatured && (
                    <div className="top-4 left-4 absolute bg-background/90 backdrop-blur px-3 py-1.5 rounded-full font-semibold text-[10px] text-foreground uppercase tracking-wider">
                        Featured
                    </div>
                )}

                <button
                    type="button"
                    aria-label={`Save ${room.name}`}
                    className="top-4 right-4 absolute flex justify-center items-center bg-black/20 hover:bg-background backdrop-blur-md rounded-full w-9 h-9 text-white hover:text-primary transition"
                >
                    <FiHeart className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col p-5 sm:p-6">

                <div className="flex justify-between items-start gap-4">

                    <div>
                        <p className="font-semibold text-[10px] text-primary uppercase tracking-[0.18em]">
                            {room.category}
                        </p>

                        <h2 className="mt-1 font-semibold text-2xl tracking-tight hotel-display">
                            {room.name}
                        </h2>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="font-semibold text-xl">
                            ${room.price}
                        </p>

                        <p className="text-muted-foreground text-xs">
                            / night
                        </p>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3 text-sm">
                    <span className="font-semibold">
                        {room.averageRating}
                    </span>

                    <span className="text-amber-500">
                        ★★★★★
                    </span>

                    <span className="text-muted-foreground">
                        ({room.totalReviews} reviews)
                    </span>
                </div>

                <p className="mt-4 text-muted-foreground text-sm line-clamp-2 leading-6">
                    {room.description}
                </p>

                {/* Room info */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 py-4 border-border border-y text-muted-foreground text-xs">

                    <span className="flex items-center gap-1.5">
                        <FiUsers className="w-4 h-4 text-primary" />
                        Up to {room.capacity} guest{room.capacity === 1 ? "" : "s"}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <FiGrid className="w-4 h-4 text-primary" />
                        {room.size}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <FiHeart className="w-4 h-4 text-primary" />
                        <FcTodoList /> {/* add bed type and bed icons */}
                        {room.bedCount} {room.bedType}
                    </span>

                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {room.amenities
                        .slice(0, 4)
                        .map((amenity) => (
                            <span
                                key={amenity.id}
                                className="bg-muted px-2.5 py-1 rounded-full text-[11px] text-muted-foreground"
                            >
                                {amenity.name}
                            </span>
                        ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">

                    <Link
                        href={`/rooms/${room.id}`}
                        className="flex flex-1 justify-center items-center px-4 py-3 border border-border hover:border-primary rounded-xl font-semibold hover:text-primary text-sm transition"
                    >
                        View Details
                    </Link>

                    <Link
                        href={`/rooms/${room.id}/book`}
                        className="flex flex-1 justify-center items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-3 rounded-xl font-semibold text-primary-foreground text-sm transition"
                    >
                        Book Now
                        <FiArrowRight className="w-4 h-4" />
                    </Link>

                </div>
            </div>
        </article>
    );
};

export default RoomCard;