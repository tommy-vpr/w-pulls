"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MoveDiagonal } from "lucide-react";

interface ProductImageZoomProps {
  src: string | null;
  alt: string;
  tierColor?: string;
}

export function ProductImageZoom({
  src,
  alt,
  tierColor = "#78ff7c",
}: ProductImageZoomProps) {
  const [hoverPosition, setHoverPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setHoverPosition({ x, y });
  };

  if (!src) {
    return (
      <div
        className="relative aspect-square rounded-2xl border border-[rgba(120,255,124,.35)] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,20,9,.85), rgba(3,10,5,.85))",
          boxShadow: "inset 0 0 30px rgba(120,255,124,.08)",
        }}
      >
        <span
          className="font-mono text-[#3de14d]"
          style={{ textShadow: "0 0 4px rgba(120,255,124,.4)" }}
        >
          NO IMAGE AVAILABLE
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image Shell */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative aspect-square overflow-hidden group"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,20,9,.85), rgba(3,10,5,.85))",
          boxShadow:
            "0 24px 60px rgba(0,0,0,.6), inset 0 0 30px rgba(120,255,124,.08)",
        }}
      >
        {/* Image Frame (adds vertical margin) */}
        <div className="absolute inset-0 flex items-center justify-center py-8">
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Scanline Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
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

        {/* Interaction Indicator (purely visual now) */}
        <div
          className="absolute bottom-4 right-4 p-2 rounded-lg border border-[rgba(120,255,124,.35)] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,28,15,.95), rgba(6,16,9,.95))",
            boxShadow: "inset 0 0 10px rgba(120,255,124,.1)",
          }}
        >
          <MoveDiagonal
            className="w-5 h-5 text-[#3de14d]"
            style={{ filter: "drop-shadow(0 0 2px rgba(120,255,124,.4))" }}
          />
        </div>

        {/* Tier Glow (hover only) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at ${hoverPosition.x}% ${hoverPosition.y}%,
              ${tierColor}15 0%,
              transparent 50%
            )`,
          }}
        />
      </div>
    </div>
  );
}
