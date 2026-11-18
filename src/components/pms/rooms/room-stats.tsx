"use client";

import React from "react";
import {
  FaCheck,
  FaCircleExclamation,
  FaDoorClosed,
  FaGear,
  FaUsers,
  FaBroom,
} from "react-icons/fa6";

export interface RoomStatistics {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
  blocked: number;
}

export function RoomStats({ stats }: { stats: RoomStatistics }) {
  const cards = [
    {
      title: "Total Rooms",
      value: stats.total,
      icon: <FaDoorClosed />,
      iconClass: "text-primary",
    },
    {
      title: "Available",
      value: stats.available,
      icon: <FaCheck />,
      iconClass: "text-emerald-600",
    },
    {
      title: "Occupied",
      value: stats.occupied,
      icon: <FaUsers />,
      iconClass: "text-blue-600",
    },
    {
      title: "Cleaning",
      value: stats.cleaning,
      icon: <FaBroom />,
      iconClass: "text-amber-600",
    },
    {
      title: "Maintenance",
      value: stats.maintenance,
      icon: <FaGear />,
      iconClass: "text-orange-600",
    },
    {
      title: "Blocked",
      value: stats.blocked,
      icon: <FaCircleExclamation />,
      iconClass: "text-red-600",
    },
  ];

  return (
    <div className="gap-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card shadow-sm p-4 border border-border rounded-2xl"
        >
          <div className="flex justify-between items-center gap-2">
            <p className="font-medium text-muted-foreground text-xs">
              {card.title}
            </p>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${card.iconClass}`}
            >
              {card.icon}
            </span>
          </div>
          <p className="mt-3 font-bold text-foreground text-2xl tracking-tight">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
