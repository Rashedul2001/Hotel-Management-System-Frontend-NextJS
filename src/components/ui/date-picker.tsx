"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "cn";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean | ((date: Date) => boolean);
  className?: string;
  buttonClassName?: string;
  id?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  minDate,
  disabled,
  className,
  buttonClassName,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const isDisabledDay = React.useCallback(
    (day: Date) => {
      if (typeof disabled === "function") {
        if (disabled(day)) return true;
      }
      if (minDate) {
        const startOfMin = new Date(
          minDate.getFullYear(),
          minDate.getMonth(),
          minDate.getDate()
        );
        const startOfDay = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate()
        );
        if (startOfDay < startOfMin) return true;
      }
      return false;
    },
    [disabled, minDate]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={typeof disabled === "boolean" ? disabled : false}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground shadow-xs transition-colors hover:bg-accent/5 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          !date && "text-muted-foreground",
          buttonClassName,
          className
        )}
      >
        <span className="truncate">
          {date ? format(date, "dd/MM/yyyy") : placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 opacity-60 ml-2" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-popover z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate);
            setOpen(false);
          }}
          disabled={isDisabledDay}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
