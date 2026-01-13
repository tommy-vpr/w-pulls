"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTierConfig, TIER_ORDER } from "@/lib/tier-config";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "BASEBALL", label: "Baseball" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "FOOTBALL", label: "Football" },
  { value: "HOCKEY", label: "Hockey" },
  { value: "SOCCER", label: "Soccer" },
  { value: "POKEMON", label: "Pokémon" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!" },
  { value: "DRAGON_BALL", label: "Dragon Ball" },
  { value: "MAGIC_THE_GATHERING", label: "Magic: The Gathering" },
  { value: "ONE_PIECE", label: "One Piece" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

const tierOptions = [
  { value: "all", label: "All Tiers" },
  ...TIER_ORDER.map((tier) => ({
    value: tier,
    label: getTierConfig(tier).label,
  })),
];

interface ProductsFiltersProps {
  showTierFilter?: boolean;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
}

export function ProductsFilters({
  showTierFilter = true,
  showCategoryFilter = true,
  showStatusFilter = true,
}: ProductsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

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

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ category: value })}`);
    });
  };

  const handleTierChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ tier: value })}`);
    });
  };

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ status: value })}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("category") ||
    searchParams.get("tier") ||
    searchParams.get("status");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
            />
          </div>

          {/* Category Filter */}
          {showCategoryFilter && (
            <Select
              value={searchParams.get("category") || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-violet-500/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {categoryOptions.map((option) => (
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
          )}

          {/* Tier Filter */}
          {showTierFilter && (
            <Select
              value={searchParams.get("tier") || "all"}
              onValueChange={handleTierChange}
            >
              <SelectTrigger className="w-[160px] bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-violet-500/50">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {tierOptions.map((option) => (
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
          )}

          {/* Status Filter */}
          {showStatusFilter && (
            <Select
              value={searchParams.get("status") || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[140px] bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-violet-500/50">
                <SelectValue placeholder="Status" />
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
          )}
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

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {searchParams.get("search") && (
            <FilterTag
              label={`Search: "${searchParams.get("search")}"`}
              onRemove={() => handleSearch("")}
            />
          )}
          {searchParams.get("category") && (
            <FilterTag
              label={`Category: ${
                categoryOptions.find(
                  (c) => c.value === searchParams.get("category")
                )?.label
              }`}
              onRemove={() => handleCategoryChange("all")}
            />
          )}
          {searchParams.get("tier") && (
            <FilterTag
              label={`Tier: ${getTierConfig(searchParams.get("tier")).label}`}
              onRemove={() => handleTierChange("all")}
            />
          )}
          {searchParams.get("status") && (
            <FilterTag
              label={`Status: ${
                searchParams.get("status") === "active" ? "Active" : "Draft"
              }`}
              onRemove={() => handleStatusChange("all")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-300">
      {label}
      <button
        onClick={onRemove}
        className="text-zinc-500 hover:text-zinc-100 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
