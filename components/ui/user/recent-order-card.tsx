"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Sparkles, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { SerializedOrder } from "@/lib/services/order.service";

interface RecentOrderProps {
  order: SerializedOrder;
}

export function RecentOrderCard({ order }: RecentOrderProps) {
  const isPack = order.type === "PACK";
  const isProduct = order.type === "PRODUCT";

  const isRevealed = isPack && order.status === "COMPLETED" && !!order.product;

  const tier =
    isPack && order.selectedTier ? getTierConfig(order.selectedTier) : null;

  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="group block rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden transition-colors hover:border-zinc-600"
    >
      {/* Image / Visual */}
      <div className="relative aspect-square overflow-hidden p-4">
        {/* Image */}
        {order.product?.imageUrl ? (
          <img
            src={order.product.imageUrl}
            alt={order.product.title}
            className="h-full w-full object-contain transition duration-150
            opacity-60 group-hover:opacity-100"
          />
        ) : isPack ? (
          <div className="h-full w-full flex items-center justify-center">
            <Sparkles
              className={cn(
                "h-10 w-10 opacity-40 transition-all duration-300",
                tier?.color,
                "group-hover:opacity-60 group-hover:scale-110",
              )}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-10 w-10 text-zinc-500 opacity-40" />
          </div>
        )}

        {/* Tier Badge (PACK only) */}
        {isPack && tier && (
          <span
            className={cn(
              "absolute top-2 left-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border backdrop-blur-sm",
              tier.bgColor,
              tier.color,
              "border-current/20",
            )}
          >
            {tier.label}
          </span>
        )}

        {/* Status Badge */}
        <span
          className={cn(
            "absolute top-2 right-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium backdrop-blur-sm",
            order.status === "COMPLETED"
              ? "bg-emerald-900/40 text-emerald-400"
              : "bg-amber-900/40 text-amber-400",
          )}
        >
          {isPack
            ? order.status === "COMPLETED"
              ? "Revealed"
              : "Pending"
            : order.status}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-3 bg-zinc-950/40">
        <p className="text-xs text-zinc-500">
          {isPack ? order.packName : "Product Order"}
        </p>

        <p className="font-medium text-zinc-100 truncate">
          {order.product?.title ?? "Order"}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-zinc-500">
            {format(new Date(order.createdAt), "MMM d")}
          </span>

          <span className="text-sm font-medium text-zinc-300">
            ${(order.amount / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
