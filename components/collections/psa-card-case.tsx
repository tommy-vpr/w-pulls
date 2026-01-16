// components/collection/psa-card-case.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";
import { SerializedCollectionItem } from "@/lib/services/collection.service";

interface PSACardCaseProps {
  item: SerializedCollectionItem;
  className?: string;
}

export function PSACardCase({ item, className }: PSACardCaseProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const caseRef = useRef<HTMLDivElement>(null);

  const tier = getTierConfig(item.tier);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!caseRef.current) return;

    const rect = caseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn("perspective-1000", className)}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={caseRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* PSA Case Outer Shell */}
        <div className="relative rounded-sm overflow-hidden shadow-2xl">
          {/* Case background - dark plastic look */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black" />

          {/* Plastic shine effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
              isHovering && "opacity-100"
            )}
            style={{
              background: `radial-gradient(circle at ${50 + rotate.y * 3}% ${
                50 + rotate.x * 3
              }%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />

          <div className="relative p-3">
            {/* PSA Label Header */}
            <div className="relative mb-3 rounded-sm overflow-hidden">
              {/* Label background with holographic effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600" />
              <div
                className={cn(
                  "absolute inset-0 opacity-50 transition-all duration-300",
                  isHovering && "opacity-80"
                )}
                style={{
                  background: `linear-gradient(${
                    90 + rotate.y * 5
                  }deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                }}
              />

              <div className="relative px-4 py-3">
                {/* Top row */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-white/90 tracking-wider">
                    W-PULLS CERTIFIED
                  </span>
                  <span className="text-[10px] font-mono text-white/80">
                    #{item.orderId.slice(-8).toUpperCase()}
                  </span>
                </div>

                {/* Card name */}
                <p className="text-sm font-bold text-white truncate">
                  {item.title}
                </p>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-white/80">
                    {item.category.replace(/_/g, " ")}
                  </span>
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      getTierBadgeClass(item.tier)
                    )}
                  >
                    {tier.label.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Window */}
            <div className="relative">
              {/* Inner case frame */}
              <div className="absolute inset-0 rounded-sm border-4 border-zinc-700/50 pointer-events-none z-10" />

              {/* Plastic window shine */}
              <div
                className="absolute inset-0 rounded-sm z-20 pointer-events-none"
                style={{
                  background: `linear-gradient(${
                    135 + rotate.y * 2
                  }deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)`,
                }}
              />

              {/* Inner shadow for depth */}
              <div className="absolute inset-0 rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none" />

              {/* Card holder background */}
              <div className="bg-black rounded-sm p-2">
                {/* The actual card */}
                <div className="relative aspect-[2.5/3.5] rounded-sm overflow-hidden bg-zinc-900">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600 text-4xl">
                      ?
                    </div>
                  )}

                  {/* Card surface shine */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
                      isHovering && "opacity-100"
                    )}
                    style={{
                      background: `linear-gradient(${
                        105 + rotate.y * 4
                      }deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom label */}
            <div className="mt-3 px-3 py-2 bg-zinc-800/80 rounded-sm border border-zinc-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Value
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    ${item.value.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Pack
                  </p>
                  <p className="text-sm font-medium text-zinc-300">
                    {item.packName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Case edge highlights */}
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-zinc-600/50 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-zinc-600/50 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
        </div>

        {/* 3D shadow */}
        <div
          className="absolute -inset-4 -z-10 rounded-sm opacity-50 blur-xl transition-all duration-300"
          style={{
            background: isHovering
              ? `radial-gradient(circle at ${50 + rotate.y * 2}% ${
                  50 + rotate.x * 2
                }%, ${tier.hexColor}40 0%, transparent 70%)`
              : "transparent",
          }}
        />
      </div>
    </div>
  );
}
