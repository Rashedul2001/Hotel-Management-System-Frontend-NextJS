"use client";

import React, { useEffect, useState } from "react";
import { FaFilter, FaMagnifyingGlass } from "react-icons/fa6";
import { useDebouncedCallback } from "use-debounce";
import { ROOM_CATEGORIES, ROOM_STATUSES } from "./room-constants";

interface RoomFiltersProps {
  searchTerm: string;
  status: string;
  category: string;
  onFilterChange: (updates: {
    SearchTerm?: string | null;
    Status?: string | null;
    Category?: string | null;
    pageNumber: number;
  }) => void;
}

export function RoomFilters({
  searchTerm,
  status,
  category,
  onFilterChange,
}: RoomFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchTerm);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onFilterChange({
      SearchTerm: val.trim() || null,
      pageNumber: 1,
    });
  }, 300);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    debouncedSearch(val);
  };

  return (
    <div className="bg-card shadow-sm p-4 border border-border rounded-2xl">
      <div className="flex xl:flex-row flex-col xl:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <FaMagnifyingGlass className="top-1/2 left-3 absolute text-muted-foreground text-sm -translate-y-1/2 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search room number, room name or description..."
            className="bg-background pr-4 pl-10 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full h-11 text-foreground placeholder:text-muted-foreground text-sm transition"
          />
        </div>

        <div className="flex sm:flex-row flex-col gap-3">
          <div className="relative">
            <FaFilter className="top-1/2 left-3 absolute text-muted-foreground text-xs -translate-y-1/2 pointer-events-none" />
            <select
              value={status}
              onChange={(e) =>
                onFilterChange({
                  Status: e.target.value === "All" ? null : e.target.value,
                  pageNumber: 1,
                })
              }
              aria-label="Filter by status"
              className="bg-background pr-8 pl-9 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full min-w-[180px] h-11 text-foreground text-sm"
            >
              <option value="All">All statuses</option>
              {ROOM_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <select
            value={category}
            onChange={(e) =>
              onFilterChange({
                Category: e.target.value === "All" ? null : e.target.value,
                pageNumber: 1,
              })
            }
            aria-label="Filter by category"
            className="bg-background px-4 border border-input focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 min-w-[170px] h-11 text-foreground text-sm"
          >
            <option value="All">All room categories</option>
            {ROOM_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
