"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PP") : "From date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFrom}
              onSelect={handleDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PP") : "To date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateTo}
              onSelect={handleDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground"
        >
          <X className="mr-2 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
