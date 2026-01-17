"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { SerializedProduct } from "@/types/product";
import { TiltCard } from "@/components/ui/tilt-card";
import { MetalTierBadge } from "./Metaltierbadge";

interface ProductCardProps {
  product: SerializedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const tierConfig = getTierConfig(product.tier);

  return (
    <div>
      <TiltCard>
        <Link
          href={`/store/${product.slug}`}
          className="group relative h-full min-h-[360px] flex flex-col overflow-hidden rounded-xl bg-zinc-900 border 
        border-zinc-800 transition-all duration-300 hover:border-zinc-700 p-2"
        >
          {/* Image Wrapper */}
          <div className="relative p-3 bg-zinc-800 rounded-lg">
            {product.imageUrl ? (
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-zinc-600 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Hover Glow Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl z-[5]"
            style={{
              background: `radial-gradient(
            circle at 50% 100%,
            rgba(250, 250, 250, 0.08) 30%,
            transparent 60%
            )`,
            }}
          />
        </Link>
      </TiltCard>
      {/* Content Overlay - Bottom */}
      <div className="relative mt-2">
        {/* Tier Badge - Top Left */}
        <div className="mb-1">
          <MetalTierBadge label={tierConfig.label} tier={product.tier} />
        </div>
        <h3 className="font-['Oxanium',monospace] text-zinc-300 line-clamp-2 text-xs sm:text-base drop-shadow-lg">
          {product.title}
        </h3>

        <div className="font-mono flex items-center justify-between">
          {/* <span className="font-light text-emerald-400">
            ${Number(product.price).toFixed(2)}
          </span> */}

          <p
            className="text-base font-mono text-[#78ff7c]"
            style={{ textShadow: "0 0 6px rgba(120,255,124,.4)" }}
          >
            ${product.price.toString()}
          </p>

          {!product.isActive && (
            <span className="text-xs text-zinc-400 bg-zinc-800/80 backdrop-blur-sm px-2 py-1 rounded">
              Sold
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
