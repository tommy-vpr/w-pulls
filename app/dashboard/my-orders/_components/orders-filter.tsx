"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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

    params.delete("page"); // Reset to page 1
    router.push(`?${params.toString()}`);
  };

  const activeStatus = currentStatus || "all";

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="ghost"
          size="sm"
          onClick={() => handleFilter(filter.value)}
          className={cn(
            "rounded-full px-4 transition-all",
            activeStatus === filter.value
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
