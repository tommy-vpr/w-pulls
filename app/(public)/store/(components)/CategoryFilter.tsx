"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

// Adjust these to match your actual categories
const CATEGORIES = [
  { value: "", label: "All" },
  { value: "SPORTS", label: "Sports" },
  { value: "POKEMON", label: "Pokémon" },
  { value: "TRADING_CARDS", label: "Trading Cards" },
  { value: "COLLECTIBLES", label: "Collectibles" },
];

interface CategoryFilterProps {
  currentCategory?: string;
}

export function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to page 1

    startTransition(() => {
      router.push(`/store?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const isActive =
          currentCategory === category.value ||
          (!currentCategory && !category.value);

        return (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            disabled={isPending}
            className={cn(
              "cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "border disabled:opacity-50",
              isActive
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
