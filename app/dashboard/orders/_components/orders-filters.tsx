"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

export function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined
  );

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      // Reset to page 1 when filters change
      newParams.delete("page");

      return newParams.toString();
    },
    [searchParams]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ search: value })}`);
    });
  };

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ status: value })}`);
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          dateFrom: date ? date.toISOString() : null,
        })}`
      );
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          dateTo: date ? date.toISOString() : null,
        })}`
      );
    });
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom(undefined);
    setDateTo(undefined);
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("dateFrom") ||
    searchParams.get("dateTo");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="cursor-pointer w-[180px] bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-violet-500/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-2 w-[180px] px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm text-left transition-colors hover:bg-zinc-800",
                !dateFrom ? "text-zinc-500" : "text-zinc-100"
              )}
            >
              <Calendar className="h-4 w-4" />
              {dateFrom ? format(dateFrom, "PP") : "From date"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-zinc-900 border-zinc-800"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
              className="bg-zinc-900"
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-2 w-[180px] px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800/50 text-sm text-left transition-colors hover:bg-zinc-800",
                !dateTo ? "text-zinc-500" : "text-zinc-100"
              )}
            >
              <Calendar className="h-4 w-4" />
              {dateTo ? format(dateTo, "PP") : "To date"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-zinc-900 border-zinc-800"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={dateTo}
              onSelect={handleDateToChange}
              initialFocus
              className="bg-zinc-900"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
