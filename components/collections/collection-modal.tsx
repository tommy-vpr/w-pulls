"use client";

import { useEffect } from "react";
import { X, Calendar, Tag } from "lucide-react";
import Image from "next/image";
import { SerializedCollectionItem } from "@/lib/services/collection.service";
import { cn } from "@/lib/utils";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";
import { formatDistanceToNow } from "date-fns";
import { PSACardCase } from "./psa-card-case";

interface CollectionModalProps {
  item: SerializedCollectionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CollectionModal({
  item,
  isOpen,
  onClose,
}: CollectionModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  const tier = getTierConfig(item.tier);

  return (
    <div
      className={cn(
        " fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <PSACardCase item={item} className="w-88" />
      </div>
      {/* Close button */}
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-8 right-8 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
