"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { MetalTierBadge } from "../../(components)/Metaltierbadge";
import { TiltCard } from "@/components/ui/tilt-card";

interface RelatedProductsProps {
  products: Product[];
}

const tierColors: Record<string, string> = {
  COMMON: "#78ff7c",
  UNCOMMON: "#b1ffb5",
  RARE: "#7cc8ff",
  ULTRA_RARE: "#ffd97c",
  SECRET_RARE: "#ff7cff",
  BANGER: "#ff7c7c",
  GRAIL: "#ffd700",
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => {
        const tierConfig = getTierConfig(product.tier);
        const tierColor = tierColors[product.tier] || "#78ff7c";

        return (
          <Link
            key={product.id}
            href={`/store/${product.slug}`}
            className="group flex flex-col"
          >
            {/* Image Card */}
            <TiltCard>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-contain transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-mono text-[#3de14d] text-sm">
                      NO IMAGE
                    </span>
                  </div>
                )}

                {/* Scanline */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background: `repeating-linear-gradient(
                    to bottom,
                    rgba(120,255,124,0.03) 0px,
                    rgba(120,255,124,0.03) 1px,
                    rgba(0,0,0,0.05) 2px,
                    rgba(0,0,0,0.05) 3px
                  )`,
                  }}
                />

                {/* Vignette */}
                {/* <div
                className="absolute inset-0 pointer-events-none"
                style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,.4)" }}
              /> */}

                {/* Hover Glow */}
                {/* <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                style={{
                  background: `radial-gradient(circle at 50% 100%, ${tierColor}20 0%, transparent 60%)`,
                }}
              /> */}
              </div>
            </TiltCard>

            {/* Content */}
            <div className="mt-2 px-1">
              {/* Tier Badge */}
              <MetalTierBadge label={tierConfig.label} tier={product.tier} />

              <h3
                className="mt-1 font-mono font-medium text-[#eafbe0] line-clamp-1 text-sm group-hover:text-[#78ff7c] transition-colors"
                style={{ textShadow: "0 0 0.5px rgba(120,255,124,.35)" }}
              >
                {product.title}
              </h3>
              <p
                className="mt-1 text-base font-bold font-mono text-[#78ff7c]"
                style={{ textShadow: "0 0 6px rgba(120,255,124,.4)" }}
              >
                ${product.price.toString()}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
