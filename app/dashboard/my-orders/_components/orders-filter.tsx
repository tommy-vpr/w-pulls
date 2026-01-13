"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrdersFilterProps {
  currentStatus?: string;
}

const filters = [
  { value: "all", label: "All" },
  { value: "COMPLETED", label: "Revealed" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
];

export function OrdersFilter({ currentStatus }: OrdersFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const activeStatus = currentStatus || "all";

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeStatus === filter.value
              ? "bg-white text-zinc-900 shadow-sm"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
