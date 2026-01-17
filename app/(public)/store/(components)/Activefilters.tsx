"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getTierConfig } from "@/lib/tier-config";

interface ActiveFiltersProps {
  search?: string;
  category?: string;
  tier?: string;
}

export function ActiveFilters({ search, category, tier }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = search || category || tier;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/store?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/store");
  };

  if (!hasFilters) return null;

  const tierConfig = tier ? getTierConfig(tier) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 mb-6"
    >
      <span className="text-sm text-zinc-500">Active filters:</span>

      <AnimatePresence mode="popLayout">
        {search && (
          <motion.button
            key="search"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => removeFilter("search")}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors group"
          >
            Search: "{search}"
            <X className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
          </motion.button>
        )}

        {category && (
          <motion.button
            key="category"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => removeFilter("category")}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors group"
          >
            {category.replace(/_/g, " ")}
            <X className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
          </motion.button>
        )}

        {tier && tierConfig && (
          <motion.button
            key="tier"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => removeFilter("tier")}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-colors group border ${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor}`}
          >
            {tierConfig.label}
            <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
          </motion.button>
        )}
      </AnimatePresence>

      {(search || category || tier) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={clearAll}
          className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
        >
          Clear all
        </motion.button>
      )}
    </motion.div>
  );
}
