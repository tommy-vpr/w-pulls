"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Move, MoveDiagonal, Rotate3D } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

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
  const imageRef = useRef<HTMLDivElement>(null);

  // 3D Motion values for image
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 10%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0) 60%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xVal = ((e.clientX - rect.left) / rect.width) * 100;
    const yVal = ((e.clientY - rect.top) / rect.height) * 100;

    setHoverPosition({ x: xVal, y: yVal });

    // 3D tilt
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
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
        onMouseLeave={handleMouseLeave}
        className="relative aspect-square overflow-hidden group"
      >
        {/* Image Frame with 3D effect */}
        <div
          className="absolute inset-0 flex items-center justify-center py-8"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            ref={imageRef}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full"
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Glare masked to image shape */}
            <motion.div
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{
                background: glareBackground,
                maskImage: `url(${src})`,
                maskSize: "contain",
                maskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskImage: `url(${src})`,
                WebkitMaskSize: "contain",
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
              }}
            />
          </motion.div>
        </div>

        {/* Scanline Overlay */}
        {/* <div
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
        /> */}

        {/* Interaction Indicator */}
        <div
          className="absolute bottom-4 right-4 p-2 rounded-lg border border-[rgba(120,255,124,.35)] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,28,15,.95), rgba(6,16,9,.95))",
            boxShadow: "inset 0 0 10px rgba(120,255,124,.1)",
          }}
        >
          <Move
            className="w-5 h-5 text-[#3de14d]"
            style={{ filter: "drop-shadow(0 0 2px rgba(120,255,124,.4))" }}
          />
        </div>

        {/* Tier Glow (hover only) */}
        {/* <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at ${hoverPosition.x}% ${hoverPosition.y}%,
              ${tierColor}15 0%,
              transparent 50%
            )`,
          }}
        /> */}
      </div>
    </div>
  );
}
