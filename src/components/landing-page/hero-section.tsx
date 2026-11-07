"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Search, CalendarDays, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";

import { rooms } from "@/lib/hotel-mock-data";
import { redirect } from "next/navigation";

export function HeroSection() {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState("1");

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (checkIn) params.set("checkInDate", checkIn);
        if (checkOut) params.set("checkOutDate", checkOut);
        params.set("minCapacity", guests);

        redirect(`/rooms?${params.toString()}`);
    };

    return (
        <section className="relative min-h-[780px] lg:min-h-[850px] overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90')",
                }}
            />

            <div className="absolute inset-0 bg-black/45 dark:bg-black/55" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />

            <div className="relative flex flex-col justify-end mx-auto px-5 sm:px-8 lg:px-10 pt-32 pb-12 lg:pb-20 max-w-7xl min-h-[780px] lg:min-h-[850px]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl text-white"
                >
                    <div className="flex items-center gap-3 mb-5 font-medium text-white/80 text-sm uppercase tracking-[0.2em]">
                        <span className="bg-white/70 w-10 h-px" />
                        A refined stay awaits
                    </div>

                    <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl leading-[0.95] tracking-tight">
                        Stay somewhere
                        <span className="block text-white/80 italic">beautiful.</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-white/80 text-base sm:text-lg leading-7">
                        Thoughtfully designed rooms, unforgettable experiences, and
                        effortless hospitality—all in one place.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-10"
                >
                    <div className="bg-white/95 dark:bg-neutral-950/90 shadow-2xl backdrop-blur-xl p-3 sm:p-4 border border-white/20 rounded-3xl">
                        <div className="gap-2 grid lg:grid-cols-[1fr_1fr_0.8fr_auto]">
                            <BookingField
                                icon={<CalendarDays className="size-5" />}
                                label="Check in"
                                value={checkIn}
                                type="date"
                                onChange={setCheckIn}
                            />

                            <BookingField
                                icon={<CalendarDays className="size-5" />}
                                label="Check out"
                                value={checkOut}
                                type="date"
                                onChange={setCheckOut}
                            />

                            <BookingField
                                icon={<Users className="size-5" />}
                                label="Guests"
                                value={guests}
                                type="number"
                                onChange={setGuests}
                            />

                            <button
                                onClick={handleSearch}
                                className="group flex justify-center items-center gap-3 bg-foreground hover:opacity-90 px-7 rounded-2xl min-h-16 text-background hover:scale-[1.01] transition-all"
                            >
                                <Search className="size-5" />
                                <span className="font-medium">Find a room</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-white/70 text-sm">
                        <span>✓ Best available rates</span>
                        <span>✓ Secure booking</span>
                        <span>✓ Flexible options</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function BookingField({
    icon,
    label,
    value,
    type,
    onChange,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    type: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="flex items-center gap-3 hover:bg-muted/70 px-4 rounded-2xl min-h-16 transition-colors cursor-text">
            <span className="text-muted-foreground">{icon}</span>

            <span className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-muted-foreground text-xs">
                    {label}
                </span>

                <input
                    type={type}
                    value={value}
                    min={type === "number" ? 1 : undefined}
                    max={type === "number" ? 10 : undefined}
                    onChange={(event) => onChange(event.target.value)}
                    className="bg-transparent p-0 border-0 outline-none w-full font-medium text-sm"
                    aria-label={label}
                />
            </span>
        </label>
    );
}