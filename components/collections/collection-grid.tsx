// components/collections/collection-grid.tsx
"use client";

import { useState } from "react";
import { SerializedCollectionItem } from "@/lib/services/collection.service";
import { CollectionCard } from "./collection-card";
import { CollectionModal } from "./collection-modal";
import { cn } from "@/lib/utils";

export function CollectionGrid({
  items,
}: {
  items: SerializedCollectionItem[];
}) {
  const [selectedItem, setSelectedItem] =
    useState<SerializedCollectionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSoldBack, setShowSoldBack] = useState(false);

  const handleQuickView = (item: SerializedCollectionItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  // Filter items based on toggle
  const filteredItems = showSoldBack
    ? items
    : items.filter((item) => !item.isSoldBack);

  const soldBackCount = items.filter((i) => i.isSoldBack).length;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        No items yet — open some packs!
      </div>
    );
  }

  return (
    <>
      {/* Filter Toggle */}
      {soldBackCount > 0 && (
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setShowSoldBack(!showSoldBack)}
            className={cn(
              "cursor-pointer text-sm px-3 py-1.5 rounded-lg transition-colors",
              showSoldBack
                ? "bg-zinc-800 text-zinc-300"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-400",
            )}
          >
            {showSoldBack ? "Hide" : "Show"} sold back ({soldBackCount})
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {filteredItems.map((item) => (
          <CollectionCard
            key={item.orderItemId}
            item={item}
            onQuickView={() => handleQuickView(item)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-12 text-zinc-500">
          All items have been sold back.{" "}
          <button
            onClick={() => setShowSoldBack(true)}
            className="text-emerald-400 hover:underline"
          >
            Show sold items
          </button>
        </div>
      )}

      <CollectionModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
