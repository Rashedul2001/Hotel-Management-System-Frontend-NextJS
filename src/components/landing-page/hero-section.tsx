"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, CalendarDays, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { errorToast } from "@/components/ui/toast";
import { DatePicker } from "@/components/ui/date-picker";
import { getHeroSetting } from "@/lib/settings-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatDateToDDMMYYYY,
  validateStayDates,
} from "@/lib/date-utils";
import { startOfDay, isBefore, isSameDay, addDays } from "date-fns";

export function HeroSection() {
  const router = useRouter();

  const [heroImageUrl, setHeroImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90"
  );
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState("1");

  useEffect(() => {
    let isMounted = true;
    getHeroSetting()
      .then((data) => {
        if (isMounted && data?.imageUrl) {
          setHeroImageUrl(data.imageUrl);
        }
      })
      .catch((err) => {
        // Fallback to default gracefully if backend is offline or loading
        console.warn("[HeroSection] Using default hero image:", err?.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckInChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-in date cannot be in the past.");
        return;
      }
      if (checkOutDate && (isBefore(checkOutDate, date) || isSameDay(checkOutDate, date))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        setCheckOutDate(addDays(date, 1));
      } else if (!checkOutDate) {
        setCheckOutDate(addDays(date, 1));
      }
    }
    setCheckInDate(date);
  };

  const handleCheckOutChange = (date: Date | undefined) => {
    if (date) {
      const today = startOfDay(new Date());
      if (isBefore(date, today)) {
        errorToast("Invalid Date", "Check-out date cannot be in the past.");
        return;
      }
      if (checkInDate && (isBefore(date, checkInDate) || isSameDay(date, checkInDate))) {
        errorToast("Invalid Date", "Check-out date must be after check-in date.");
        return;
      }
    }
    setCheckOutDate(date);
  };

  const handleSearch = () => {
    let effectiveCheckIn = checkInDate;
    let effectiveCheckOut = checkOutDate;

    if (effectiveCheckIn && !effectiveCheckOut) {
      effectiveCheckOut = addDays(effectiveCheckIn, 1);
      setCheckOutDate(effectiveCheckOut);
    } else if (!effectiveCheckIn && effectiveCheckOut) {
      effectiveCheckIn = startOfDay(new Date());
      setCheckInDate(effectiveCheckIn);
    }

    const validation = validateStayDates(effectiveCheckIn, effectiveCheckOut);
    if (!validation.isValid) {
      errorToast("Validation Error", validation.error || "Please select valid check-in and check-out dates.");
      return;
    }

    const params = new URLSearchParams();

    if (effectiveCheckIn) {
      params.set("checkInDate", formatDateToDDMMYYYY(effectiveCheckIn));
    }

    if (effectiveCheckOut) {
      params.set("checkOutDate", formatDateToDDMMYYYY(effectiveCheckOut));
    }

    params.set("minCapacity", guests || "1");

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <section className="relative min-h-195 lg:min-h-212.5 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url('${heroImageUrl}')`,
        }}
      />

      <div className="absolute inset-0 bg-black/45 dark:bg-black/55" />

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/20" />

      <div className="relative flex flex-col justify-end mx-auto px-5 sm:px-8 lg:px-10 pt-32 pb-12 lg:pb-20 max-w-7xl min-h-195 lg:min-h-212.5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl text-white"
        >
          <div className="flex items-center gap-3 mb-5 font-medium text-white/80 text-sm uppercase tracking-[0.2em]">
            <span className="bg-white/70 w-10 h-px" />A refined stay awaits
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
              {/* Check in */}
              <div className="flex items-center gap-3 hover:bg-muted/70 px-4 rounded-2xl min-h-16 transition-colors">
                <span className="text-muted-foreground">
                  <CalendarDays className="size-5" />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-muted-foreground text-xs">
                    Check in
                  </span>
                  <DatePicker
                    date={checkInDate}
                    onDateChange={handleCheckInChange}
                    minDate={new Date()}
                    placeholder="dd/mm/yyyy"
                    buttonClassName="p-0 h-auto border-0 shadow-none bg-transparent hover:bg-transparent font-medium text-sm text-foreground justify-between focus:ring-0"
                  />
                </div>
              </div>

              {/* Check out */}
              <div className="flex items-center gap-3 hover:bg-muted/70 px-4 rounded-2xl min-h-16 transition-colors">
                <span className="text-muted-foreground">
                  <CalendarDays className="size-5" />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-muted-foreground text-xs">
                    Check out
                  </span>
                  <DatePicker
                    date={checkOutDate}
                    onDateChange={handleCheckOutChange}
                    minDate={checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1)}
                    placeholder="dd/mm/yyyy"
                    buttonClassName="p-0 h-auto border-0 shadow-none bg-transparent hover:bg-transparent font-medium text-sm text-foreground justify-between focus:ring-0"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-3 hover:bg-muted/70 px-4 rounded-2xl min-h-16 transition-colors">
                <span className="text-muted-foreground">
                  <Users className="size-5" />
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-muted-foreground text-xs">
                    Guests
                  </span>
                  <Select value={guests} onValueChange={(val) => setGuests(val || "1")}>
                    <SelectTrigger className="p-0 h-auto border-0 shadow-none bg-transparent hover:bg-transparent font-medium text-sm text-foreground justify-between focus:ring-0 w-full">
                      <SelectValue placeholder="1 Guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} {num === 1 ? "Guest" : "Guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="group flex justify-center items-center gap-3 bg-foreground hover:opacity-90 px-7 rounded-2xl min-h-16 text-background hover:scale-[1.01] transition-all cursor-pointer"
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
