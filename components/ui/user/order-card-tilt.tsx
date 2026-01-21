"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { SerializedOrder } from "@/lib/services/order.service";

interface OrderCardProps {
  order: SerializedOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const tier = getTierConfig(order.selectedTier);
  const isRevealed = order.status === "COMPLETED" && order.product;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform("");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative transition-transform duration-200 ease-out"
      style={{
        transform: transform,
        transformStyle: "preserve-3d",
      }}
    >
      <Link
        href={`/dashboard/orders/${order.id}`}
        className="group block rounded-xl border border-zinc-700 bg-zinc-800/50 overflow-hidden transition-colors hover:border-zinc-600"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {/* Background gradient based on tier */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity",
              tier.bgColor,
              isHovering ? "opacity-60" : "opacity-40",
            )}
          />

          {/* Product Image or Mystery */}
          {isRevealed && order.product?.imageUrl ? (
            <img
              src={order.product.imageUrl}
              alt={order.product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Sparkles
                className={cn(
                  "h-10 w-10 transition-all duration-300",
                  tier.color,
                  isHovering ? "opacity-60 scale-110" : "opacity-40",
                )}
              />
            </div>
          )}

          {/* Tier Badge */}
          {order.selectedTier && (
            <span
              className={cn(
                "absolute top-2 left-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border backdrop-blur-sm transition-all",
                tier.bgColor,
                tier.color,
                "border-current/20",
                isHovering && "shadow-lg",
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
            {order.status === "COMPLETED" ? "Revealed" : "Pending"}
          </span>

          {/* Shine effect on hover */}
          {isHovering && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `linear-gradient(
                  ${
                    Math.atan2(glarePosition.y - 50, glarePosition.x - 50) *
                      (180 / Math.PI) +
                    90
                  }deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.1) 50%,
                  transparent 100%
                )`,
              }}
            />
          )}

          {/* Glare effect */}
          {isHovering && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
              }}
            />
          )}
        </div>

        {/* Card Content */}
        <div className="p-3 relative z-10 bg-zinc-800/80">
          <p className="text-xs text-zinc-500">{order.packName}</p>
          <p className="font-medium text-zinc-100 truncate">
            {isRevealed ? order.product?.title : "Mystery Card"}
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

      {/* Outer glow on hover */}
      {/* {isHovering && (
        <div
          className={cn(
            "absolute -inset-1 rounded-xl opacity-30 blur-md -z-10 transition-opacity bg-violet-500"
          )}
        />
      )} */}
    </div>
  );
}
