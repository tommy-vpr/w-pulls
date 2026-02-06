"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  BASEBALL: "Baseball",
  BASKETBALL: "Basketball",
  FOOTBALL: "Football",
  HOCKEY: "Hockey",
  SOCCER: "Soccer",
  POKEMON: "Pokémon",
  YUGIOH: "Yu-Gi-Oh!",
  MAGIC_THE_GATHERING: "Magic: The Gathering",
  ONE_PIECE: "One Piece",
  DRAGON_BALL: "Dragon Ball",
  OTHER: "Other",
};

interface CategoryFilterProps {
  currentCategory?: string;
  categories: string[];
}

export function CategoryFilter({
  currentCategory,
  categories,
}: CategoryFilterProps) {
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
    params.delete("page");

    startTransition(() => {
      router.push(`/store?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange("")}
        disabled={isPending}
        className={cn(
          "cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all",
          "border disabled:opacity-50",
          !currentCategory
            ? "bg-violet-600 border-violet-500 text-white"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700",
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategoryChange(cat)}
          disabled={isPending}
          className={cn(
            "cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all",
            "border disabled:opacity-50",
            currentCategory === cat
              ? "bg-violet-600 border-violet-500 text-white"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-700",
          )}
        >
          {CATEGORY_LABELS[cat] || cat}
        </button>
      ))}
    </div>
  );
}
