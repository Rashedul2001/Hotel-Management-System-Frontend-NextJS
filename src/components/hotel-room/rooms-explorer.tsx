"use client";

import {
    useEffect,
    useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
    FiCalendar,
    FiCheck,
    FiChevronDown,
    FiChevronUp,
    FiFilter,
    FiGrid,
    FiList,
    FiMapPin,
    FiSearch,
    FiShare2,
    FiSliders,
    FiUsers,
    FiX,
    FiArrowRight,
    FiHeart,
} from "react-icons/fi";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Room, RoomAmenity } from "@/types/room"


import { LuArrowDownWideNarrow, LuArrowUpNarrowWide } from "react-icons/lu";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Field, FieldDescription, FieldTitle } from "../ui/field";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../ui/pagination";

type RoomCategory =
    | "All"
    | "Standard"
    | "Deluxe"
    | "Suite"
    | "Family";

type SortOption =
    | null
    | "price"
    | "price-low"
    | "price-high"
    | "rating"
    | "capacity"
    | "name";




const Categories: RoomCategory[] = [
    "All",
    "Standard",
    "Deluxe",
    "Suite",
    "Family",
];

const items: {
    value: SortOption;
    label: string;
}[] = [
        { value: null, label: "Select Sort Option" },
        {
            value: "rating",
            label: "Rating",
        },
        {
            value: "price",
            label: "Price of Rooms",
        },
        {
            value: "capacity",
            label: "Guest Capacity",
        },
        {
            value: "name",
            label: "Name of Rooms",
        },
    ];

const pageSizeOptions = [10, 25, 50, 100];

const res = await apiFetch("/api/rooms/amenities", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
});

const amenitiesData: RoomAmenity[] = await res.json();

import { parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDebouncedCallback } from 'use-debounce';
import { apiFetch } from "@/lib/api";
import RoomCard from "../ui/RoomCard";


export default function RoomsExplorer({ rooms, totalRooms }: { rooms: Room[]; totalRooms: number }) {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [view, setView] = useState<'grid' | 'list'>('grid');



    const [parameters, setParameters] = useQueryStates({
        pageNumber: parseAsInteger.withDefault(1),
        pageSize: parseAsInteger.withDefault(10),
        checkInDate: parseAsString.withDefault(""),
        checkOutDate: parseAsString.withDefault(""),
        searchTerm: parseAsString.withDefault(""),
        minPrice: parseAsFloat.withDefault(0),
        maxPrice: parseAsFloat.withDefault(500),
        minCapacity: parseAsInteger.withDefault(1),
        category: parseAsString.withDefault("All"),
        amenityIds: parseAsArrayOf(parseAsInteger).withDefault([]),
        sortBy: parseAsString.withDefault(""),
        isAscending: parseAsBoolean.withDefault(true),
    }, { shallow: false });

    const [searchInput, setSearchInput] = useState(parameters.searchTerm);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        parameters.minPrice,
        parameters.maxPrice,
    ]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchInput(parameters.searchTerm);
        setPriceRange([parameters.minPrice, parameters.maxPrice]);
    }, [
        parameters.maxPrice,
        parameters.minPrice,
        parameters.searchTerm,
    ]);

    const handleToggle = () => {
        const nextValue = !parameters.isAscending;
        setParameters({ isAscending: nextValue });
    };
    const debouncedSearch = useDebouncedCallback((value: string) => {
        setParameters({ searchTerm: value || null, pageNumber: 1 });
    }, 500, { maxWait: 2000 });
    const debouncedPriceRange = useDebouncedCallback((value: [number, number]) => {
        setParameters({
            minPrice: value[0],
            maxPrice: value[1],
            pageNumber: 1,
        });
    }, 500, { maxWait: 2000 });

    const resetQuery = () => {
        debouncedSearch.cancel();
        debouncedPriceRange.cancel();
        setSearchInput("");
        setPriceRange([0, 500]);
        setParameters({
            pageNumber: null,
            pageSize: null,
            checkInDate: null,
            checkOutDate: null,
            searchTerm: null,
            minPrice: null,
            maxPrice: null,
            minCapacity: null,
            category: null,
            amenityIds: null,
            sortBy: null,
            isAscending: null,
        });
    };

    const updateAmenity = (amenityId: number) => {
        const nextAmenityIds = parameters.amenityIds.includes(amenityId)
            ? parameters.amenityIds.filter((id) => id !== amenityId)
            : [...parameters.amenityIds, amenityId];

        setParameters({ amenityIds: nextAmenityIds });
    };

    const totalPages = Math.ceil(totalRooms / parameters.pageSize);
    const currentPage = Math.min(parameters.pageNumber, Math.max(totalPages, 1));
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
    const visiblePageNumbers = pageNumbers.length <= 5
        ? pageNumbers
        : [
            1,
            ...pageNumbers.slice(
                Math.max(1, currentPage - 2),
                Math.min(totalPages - 1, currentPage + 1),
            ),
            totalPages,
        ].filter((page, index, pages) => pages.indexOf(page) === index);

    const updatePage = (pageNumber: number) => {
        setParameters({ pageNumber });
    };

    const updatePageSize = (value: string | null) => {
        const pageSize = Number(value);

        if (!Number.isInteger(pageSize) || pageSize <= 0) {
            return;
        }

        setParameters({
            pageNumber: 1,
            pageSize,
        });
    };


    return (
        <main className="bg-background min-h-screen">

            {/* ================================================================ */}
            {/* Hero                                                             */}
            {/* ================================================================ */}

            <section className="bg-muted/30 border-border border-b">
                <div className="py-14 sm:py-20 hotel-container">

                    <div className="max-w-3xl">

                        <div className="flex items-center gap-2 mb-4 font-semibold text-primary text-sm uppercase tracking-[0.2em]">
                            <span className="bg-primary w-8 h-px" />
                            Velora Hotels
                        </div>

                        <h1 className="font-semibold text-5xl sm:text-6xl lg:text-7xl tracking-tight hotel-display">
                            Find your perfect
                            <span className="block font-normal italic">
                                room.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-muted-foreground text-base sm:text-lg leading-7">
                            Explore our collection of thoughtfully designed rooms
                            and suites. Search by your preferences and find a stay
                            that feels right for you.
                        </p>

                    </div>

                    {/* Search panel */}
                    <div className="bg-background shadow-lg mt-10 p-3 sm:p-4 border border-border rounded-2xl">

                        <div className="gap-3 grid lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">

                            {/* Search */}
                            <div className="relative">
                                <FiSearch className="top-1/2 left-4 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />

                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setSearchInput(value);
                                        debouncedSearch(value);
                                    }}
                                    placeholder="Search rooms..."
                                    className="bg-muted/30 pr-4 pl-11 border border-border focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/10 w-full h-12 text-sm transition [&::-webkit-search-cancel-button]:cursor-pointer"
                                />
                            </div>

                            {/* Check in */}
                            <label className="relative">
                                <FiCalendar className="top-1/2 left-4 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />

                                <input
                                    type="date"
                                    value={parameters.checkInDate}
                                    onChange={(event) => setParameters({ checkInDate: event.target.value })}

                                    className="bg-muted/30 pr-3 pl-11 border border-border focus:border-primary rounded-xl outline-none w-full h-12 text-sm transition"
                                    aria-label="Check in"
                                />
                            </label>

                            {/* Check out */}
                            <label className="relative">
                                <FiCalendar className="top-1/2 left-4 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />

                                <input
                                    type="date"
                                    value={parameters.checkOutDate}
                                    onChange={(event) => setParameters({ checkOutDate: event.target.value })}
                                    className="bg-muted/30 pr-3 pl-11 border border-border focus:border-primary rounded-xl outline-none w-full h-12 text-sm transition"
                                    aria-label="Check out"
                                />
                            </label>

                            {/* Guests */}
                            <label className="relative">
                                <FiUsers className="top-1/2 left-4 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />

                                <select
                                    value={String(parameters.minCapacity)}
                                    onChange={(event) => setParameters({ minCapacity: parseFloat(event.target.value) })}
                                    className="bg-muted/30 pr-8 pl-11 border border-border focus:border-primary rounded-xl outline-none w-full h-12 text-sm transition appearance-none"
                                    aria-label="Number of guests"
                                >
                                    <option value="1">1 Guest</option>
                                    <option value="2">2 Guests</option>
                                    <option value="3">3 Guests</option>
                                    <option value="4">4 Guests</option>
                                    <option value="5">5 Guests</option>
                                </select>

                                <FiChevronDown className="top-1/2 right-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 pointer-events-none" />
                            </label>

                            <button
                                type="button"
                                onClick={() => {
                                    debouncedSearch.flush();
                                    debouncedPriceRange.flush();
                                }}
                                className="bg-primary hover:bg-primary/90 px-6 rounded-xl h-12 font-semibold text-primary-foreground text-sm transition"
                            >
                                Search
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================ */}
            {/* Explorer                                                          */}
            {/* ================================================================ */}

            <section className="hotel-section">
                <div className="hotel-container">

                    {/* Mobile filter button */}
                    <div className="lg:hidden flex justify-between items-center mb-5">

                        <button
                            type="button"
                            onClick={() =>
                                setMobileFiltersOpen(true)
                            }
                            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-medium text-sm"
                        >
                            <FiSliders className="w-4 h-4" />
                            Filters
                        </button>

                        <span className="text-muted-foreground text-sm">
                            {totalRooms} rooms
                        </span>

                    </div>

                    <div className="gap-8 grid lg:grid-cols-[240px_1fr]">

                        {/* ========================================================== */}
                        {/* Desktop Sidebar                                             */}
                        {/* ========================================================== */}

                        <aside className="hidden lg:block">

                            <div className="top-24 sticky space-y-7 p-4 h-[calc(100vh-8rem)] overflow-y-auto">

                                {/* Category */}
                                <div>
                                    <h3 className="font-semibold text-sm">
                                        Room Type
                                    </h3>

                                    <div className="space-y-1 mt-4">

                                        {Categories.map(
                                            (roomCategory) => {
                                                const active =
                                                    parameters.category === roomCategory;

                                                return (
                                                    <button
                                                        key={roomCategory}
                                                        type="button"
                                                        onClick={() =>
                                                            setParameters({ category: roomCategory })
                                                        }
                                                        className={`
                              flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition
                              ${active
                                                                ? "bg-primary/10 font-semibold text-primary"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            }
                            `}
                                                    >
                                                        <span>
                                                            {roomCategory}
                                                        </span>

                                                        {active && (
                                                            <FiCheck className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>
                                </div>

                                {/* Price */}
                                <Field className="pt-6 border-border border-t">
                                    <FieldTitle>Price per night</FieldTitle>
                                    <FieldDescription>
                                        ${priceRange[0]} - ${priceRange[1]} per night
                                    </FieldDescription>
                                    <Slider
                                        value={priceRange}
                                        onValueChange={(value) => {
                                            if (!Array.isArray(value)) return;
                                            const nextRange: [number, number] = [
                                                value[0],
                                                value[1],
                                            ];
                                            setPriceRange(nextRange);
                                            debouncedPriceRange(nextRange);
                                        }}
                                        min={0}
                                        max={1000}
                                        step={10}
                                        aria-label="Price range"
                                        className="mt-2"
                                    />
                                </Field>

                                {/* Amenities */}
                                <div className="pt-6 border-border border-t">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAdvancedOpen(
                                                !advancedOpen
                                            )
                                        }
                                        className="flex justify-between items-center w-full font-semibold text-sm"
                                    >
                                        Amenities

                                        {advancedOpen ? (
                                            <FiChevronUp className="w-4 h-4" />
                                        ) : (
                                            <FiChevronDown className="w-4 h-4" />
                                        )}
                                    </button>

                                    {advancedOpen && (
                                        <div className="space-y-3 mt-4">

                                            {amenitiesData.map((amenity) => {
                                                const checked =
                                                    parameters.amenityIds?.includes(
                                                        amenity.id
                                                    );

                                                return (
                                                    <label
                                                        key={amenity.id}
                                                        className="flex items-center gap-3 text-muted-foreground text-sm cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() =>
                                                                updateAmenity(
                                                                    amenity.id
                                                                )
                                                            }
                                                            className="border-border rounded w-4 h-4 accent-primary"
                                                        />

                                                        {amenity.name}
                                                    </label>
                                                );
                                            })}

                                        </div>
                                    )}

                                </div>

                                {/* Clear */}
                                {(parameters.searchTerm ||
                                    parameters.checkInDate ||
                                    parameters.checkOutDate ||
                                    parameters.category !== "All" ||
                                    parameters.minPrice > 0 ||
                                    parameters.maxPrice < 500 ||
                                    parameters.minCapacity !== 1 ||
                                    parameters.amenityIds.length > 0) && (
                                        <Button
                                            variant={"outline"}
                                            onClick={resetQuery}
                                            className="flex items-center gap-2 font-medium text-destructive text-sm"
                                        >
                                            <FiX className="w-4 h-4" />
                                            Clear all filters
                                        </Button>
                                    )}

                            </div>
                        </aside>

                        {/* ========================================================== */}
                        {/* Results                                                      */}
                        {/* ========================================================== */}

                        <div className="min-w-0">

                            {/* Toolbar */}
                            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-7 pb-5 border-border border-b">

                                <div>
                                    <p className="font-semibold text-sm">
                                        {totalRooms}{" "}
                                        {totalRooms === 1
                                            ? "room"
                                            : "rooms"}{" "}
                                        available
                                    </p>

                                    <p className="mt-1 text-muted-foreground text-xs">
                                        {parameters.checkInDate && parameters.checkOutDate
                                            ? `${parameters.checkInDate} → ${parameters.checkOutDate}`
                                            : "Flexible dates"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Rooms per page */}
                                    <Field orientation="horizontal" className="w-fit">
                                        <Select
                                            value={String(parameters.pageSize)}
                                            onValueChange={updatePageSize}
                                        >
                                            <SelectTrigger
                                                className="bg-background border border-border focus:border-primary rounded-lg outline-none w-20 h-10! font-medium text-sm appearance-none"
                                                id="select-rows-per-page"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent align="start">
                                                <SelectGroup>
                                                    <SelectLabel>Rooms per Page</SelectLabel>
                                                    {pageSizeOptions.map((pageSize) => (
                                                        <SelectItem
                                                            key={pageSize}
                                                            value={String(pageSize)}
                                                        >
                                                            {pageSize}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Sort */}
                                    <Select items={items} value={parameters.sortBy || null} onValueChange={value => setParameters({ sortBy: value })}>
                                        <SelectTrigger className="bg-background border border-border focus:border-primary rounded-lg outline-none w-42 h-10! font-medium text-sm appearance-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Sort By</SelectLabel>
                                                {items.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        onClick={handleToggle}
                                        className="flex justify-center items-center bg-background border border-border focus:border-primary rounded-sm w-10 h-10 text-xl"

                                    >
                                        {parameters.isAscending ? <LuArrowUpNarrowWide /> : <LuArrowDownWideNarrow />}

                                    </Button>


                                    {/* View */}
                                    <div className="hidden sm:flex items-center p-1 border border-border rounded-lg">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setView("grid")
                                            }
                                            aria-label="Grid view"
                                            className={`rounded-md p-2 ${view === "grid"
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground"
                                                }`}
                                        >
                                            <FiGrid className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setView("list")
                                            }
                                            aria-label="List view"
                                            className={`rounded-md p-2 ${view === "list"
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground"
                                                }`}
                                        >
                                            <FiList className="w-4 h-4" />
                                        </button>

                                    </div>

                                </div>
                            </div>

                            {/* Results */}
                            {totalRooms > 0 ? (
                                <>
                                    <div
                                        className={
                                            view === "grid"
                                                ? "grid gap-5 md:grid-cols-2"
                                                : "space-y-5"
                                        }
                                    >
                                        {rooms.map((room) => (
                                            <RoomCard
                                                key={room.id}
                                                room={room}
                                                view={view}
                                            />
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <Pagination className="mt-8">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={`?pageNumber=${Math.max(1, currentPage - 1)}`}
                                                        aria-disabled={currentPage === 1}
                                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            updatePage(currentPage - 1);
                                                        }}
                                                    />
                                                </PaginationItem>

                                                {visiblePageNumbers.map((pageNumber, index) => {
                                                    const previousPage = visiblePageNumbers[index - 1];

                                                    return (
                                                        <PaginationItem key={pageNumber}>
                                                            {previousPage && pageNumber - previousPage > 1 && (
                                                                <PaginationEllipsis />
                                                            )}
                                                            <PaginationLink
                                                                href={`?pageNumber=${pageNumber}`}
                                                                isActive={pageNumber === currentPage}
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    updatePage(pageNumber);
                                                                }}
                                                            >
                                                                {pageNumber}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                })}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        href={`?pageNumber=${Math.min(totalPages, currentPage + 1)}`}
                                                        aria-disabled={currentPage === totalPages}
                                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            updatePage(currentPage + 1);
                                                        }}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    )}
                                </>
                            ) : (
                                <div className="px-6 py-20 border border-border border-dashed rounded-2xl text-center">

                                    <div className="flex justify-center items-center bg-muted mx-auto rounded-full w-14 h-14">
                                        <FiSearch className="w-6 h-6 text-muted-foreground" />
                                    </div>

                                    <h2 className="mt-5 font-semibold text-2xl hotel-display">
                                        No rooms found
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-6">
                                        We could not find a room matching your current
                                        search and filters. Try changing your dates,
                                        guest count, price range, or room type.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={resetQuery}
                                        className="bg-primary mt-6 px-5 py-3 rounded-xl font-semibold text-primary-foreground text-sm"
                                    >
                                        Clear Filters
                                    </button>

                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================ */}
            {/* Mobile Filter Drawer                                              */}
            {/* ================================================================ */}

            {mobileFiltersOpen && (
                <div className="lg:hidden z-[100] fixed inset-0">

                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={() =>
                            setMobileFiltersOpen(false)
                        }
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    <aside className="right-0 bottom-0 left-0 absolute bg-background shadow-2xl p-6 rounded-t-3xl max-h-[90dvh] overflow-y-auto">

                        <div className="mx-auto mb-6 bg-border rounded-full w-12 h-1" />

                        <div className="flex justify-between items-center">

                            <div>
                                <h2 className="font-semibold text-lg">
                                    Filters
                                </h2>

                                <p className="mt-1 text-muted-foreground text-xs">
                                    Refine your room search
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileFiltersOpen(false)
                                }
                                className="flex justify-center items-center border border-border rounded-full w-9 h-9"
                            >
                                <FiX className="w-4 h-4" />
                            </button>

                        </div>

                        {/* Category */}
                        <div className="mt-7">

                            <h3 className="font-semibold text-sm">
                                Room Type
                            </h3>

                            <div className="gap-2 grid grid-cols-2 mt-3">

                                {Categories.map(
                                    (roomCategory) => {
                                        const active =
                                            parameters.category === roomCategory;

                                        return (
                                            <button
                                                key={roomCategory}
                                                type="button"
                                                onClick={() =>
                                                    setParameters({ category: roomCategory })
                                                }
                                                className={`
                          rounded-xl border px-3 py-3 text-sm font-medium
                          ${active
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border"
                                                    }
                        `}
                                            >
                                                {roomCategory}
                                            </button>
                                        );
                                    }
                                )}

                            </div>
                        </div>

                        {/* Price */}
                        <Field className="mt-7">
                            <FieldTitle>Price per night</FieldTitle>
                            <FieldDescription>
                                ${priceRange[0]} - ${priceRange[1]} per night
                            </FieldDescription>
                            <Slider
                                value={priceRange}
                                onValueChange={(value) => {
                                    if (!Array.isArray(value)) return;
                                    const nextRange: [number, number] = [
                                        value[0],
                                        value[1],
                                    ];
                                    setPriceRange(nextRange);
                                    debouncedPriceRange(nextRange);
                                }}
                                min={0}
                                max={1000}
                                step={10}
                                aria-label="Price range"
                                className="mt-2"
                            />
                        </Field>

                        {/* Amenities */}
                        <div className="mt-7">

                            <h3 className="font-semibold text-sm">
                                Amenities
                            </h3>

                            <div className="gap-3 grid grid-cols-2 mt-3">

                                {amenitiesData.map((amenity) => {

                                    const checked: boolean =
                                        parameters.amenityIds.includes(
                                            amenity.id
                                        );

                                    return (
                                        <label
                                            key={amenity.id}
                                            className="flex items-center gap-2 text-muted-foreground text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    updateAmenity(amenity.id)
                                                }
                                                className="w-4 h-4 accent-primary"
                                            />

                                            {amenity.name}
                                        </label>
                                    );
                                })}

                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">

                            <button
                                type="button"
                                onClick={resetQuery}
                                className="flex-1 px-4 py-3 border border-border rounded-xl font-semibold text-sm"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileFiltersOpen(false)
                                }
                                className="flex-1 bg-primary px-4 py-3 rounded-xl font-semibold text-primary-foreground text-sm"
                            >
                                Show {totalRooms} Rooms
                            </button>

                        </div>

                    </aside>
                </div>
            )}
        </main>
    );
}