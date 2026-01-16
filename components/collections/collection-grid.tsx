"use client";

import { useState } from "react";
import { SerializedCollectionItem } from "@/lib/services/collection.service";
import { CollectionCard } from "./collection-card";
import { CollectionModal } from "./collection-modal";

export function CollectionGrid({
  items,
}: {
  items: SerializedCollectionItem[];
}) {
  const [selectedItem, setSelectedItem] =
    useState<SerializedCollectionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuickView = (item: SerializedCollectionItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        No items yet — open some packs!
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {items.map((item) => (
          <CollectionCard
            key={item.orderId}
            item={item}
            onQuickView={() => handleQuickView(item)}
          />
        ))}
      </div>

      <CollectionModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
