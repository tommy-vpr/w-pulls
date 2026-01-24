// components/collections/collection-card.tsx
"use client";

import Image from "next/image";
import { Expand } from "lucide-react";
import { SerializedCollectionItem } from "@/lib/services/collection.service";
import { cn } from "@/lib/utils";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";

interface CollectionCardProps {
  item: SerializedCollectionItem;
  onQuickView: () => void;
}

export function CollectionCard({ item, onQuickView }: CollectionCardProps) {
  const tier = getTierConfig(item.tier);

  return (
    <div
      className={cn(
        "group relative rounded-lg overflow-hidden border bg-zinc-900/60 transition-all",
        item.isSoldBack
          ? "border-zinc-800/50 opacity-75"
          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-black/20",
      )}
    >
      <div className="relative aspect-square">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className={cn("object-cover", item.isSoldBack && "grayscale")}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-zinc-600">
            ?
          </div>
        )}

        {/* Tier Badge */}
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border backdrop-blur-sm",
            getTierBadgeClass(item.tier),
          )}
        >
          {tier.label}
        </span>

        {/* Sold Back Overlay */}
        {item.isSoldBack && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            {/* <div className="flex flex-col px-4 py-2 bg-red-500 rounded">
              <span className="text-red-900 font-bold text-sm">Sold Back</span>
              <span className="text-white text-xs">
                +${((item.buybackAmount ?? 0) / 100).toFixed(2)}
              </span>
            </div> */}
            <div className="flex flex-col items-center">
              <span className="text-red-500 font-bold text-4xl">Sold Back</span>
              <span className="text-white text-xl">
                +${((item.buybackAmount ?? 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Hover Overlay - only for non-sold items */}
        {!item.isSoldBack && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onQuickView}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              <Expand className="h-4 w-4" />
              View Card
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-zinc-500">{tier.label}</p>
        <p className="font-medium text-white truncate">{item.title}</p>
        {item.isSoldBack ? (
          <p className="text-sm text-zinc-500 line-through">
            ${item.value.toFixed(2)}
          </p>
        ) : (
          <p className="text-sm text-blue-500">${item.value.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
