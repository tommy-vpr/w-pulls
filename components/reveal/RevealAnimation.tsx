"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SerializedProduct } from "@/types/product";
import RevealStage, { RevealState } from "./RevealStage";

interface RevealAnimationProps {
  product: SerializedProduct;
  tier: string;
  packName: string;
}

// In RevealAnimation component
const getProxiedImageUrl = (url: string | null) => {
  if (!url) return "/images/card-front.webp";
  if (url.startsWith("/")) return url; // Local images don't need proxy
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};

const tierConfig: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  COMMON: { color: "text-slate-400", bgColor: "bg-slate-500", label: "Common" },
  UNCOMMON: {
    color: "text-green-400",
    bgColor: "bg-green-500",
    label: "Uncommon",
  },
  RARE: { color: "text-blue-400", bgColor: "bg-blue-500", label: "Rare" },
  ULTRA_RARE: {
    color: "text-purple-400",
    bgColor: "bg-purple-500",
    label: "Ultra Rare",
  },
  SECRET_RARE: {
    color: "text-yellow-400",
    bgColor: "bg-yellow-500",
    label: "Secret Rare",
  },
  BANGER: {
    color: "text-orange-400",
    bgColor: "bg-orange-500",
    label: "Banger 🔥",
  },
  GRAIL: {
    color: "text-pink-400",
    bgColor: "bg-gradient-to-r from-pink-500 to-yellow-500",
    label: "GRAIL 👑",
  },
};

export function RevealAnimation({
  product,
  tier,
  packName,
}: RevealAnimationProps) {
  const [state, setState] = useState<RevealState>("IDLE");

  const tierStyle = tierConfig[tier] || tierConfig.COMMON;

  const handleRevealSequence = () => {
    setState("CHARGING");
    setTimeout(() => {
      setState("REVEAL");
      setTimeout(() => {
        setState("RESULT");
      }, 300);
    }, 2500);
  };

  return (
    <>
      {/* Pack name and state indicator */}
      <div className="absolute z-10 top-5 left-1/2 -translate-x-1/2 text-center">
        <p className="text-lg text-gray-400">{packName}</p>
        {state === "IDLE" && (
          <p className="text-xl font-medium text-gray-300">
            Your mystery card awaits...
          </p>
        )}
        {state === "CHARGING" && (
          <p className="text-xl font-medium text-orange-400 animate-pulse">
            Charging...
          </p>
        )}
        {state === "REVEAL" && (
          <p className="text-xl font-medium text-yellow-400">Revealing!</p>
        )}
      </div>

      {/* Open Pack Button */}
      {state === "IDLE" && (
        <div className="absolute z-10 bottom-10 left-1/2 -translate-x-1/2">
          <button onClick={handleRevealSequence} className="neon-btn">
            <span className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              Open Pack
            </span>
          </button>
        </div>
      )}

      {/* Result UI */}
      {state === "RESULT" && (
        <div className="absolute z-10 bottom-10 left-1/2 -translate-x-1/2 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Badge
            className={cn(
              "text-lg px-4 py-1 mb-4",
              tierStyle.bgColor,
              "text-white border-0"
            )}
          >
            {tierStyle.label}
          </Badge>

          <h2 className="text-2xl font-bold mb-2 text-gray-200">
            {product.title}
          </h2>
          <p className="text-3xl font-bold text-primary mb-6">
            ${Number(product.price).toFixed(2)}
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/packs">Open Another</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/products/${product.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Three.js Canvas */}
      <div className="w-full h-full" style={{ background: "#050505" }}>
        <Canvas
          camera={{ position: [0, 3.5, 8], fov: 42 }}
          gl={{ antialias: true, alpha: false }}
          shadows
        >
          <Suspense fallback={null}>
            <RevealStage
              state={state}
              cardFrontImageUrl={getProxiedImageUrl(product.imageUrl)}
              cardBackImageUrl="/images/card-back.webp"
              packFrontImageUrl="/images/pack-front.webp"
              packBackImageUrl="/images/pack-back.webp"
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Neon button styles */}
      <style jsx>{`
        .neon-btn {
          position: relative;
          padding: 16px 48px;
          border-radius: 9999px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #20c828, #14d13d);
          border: none;
          cursor: pointer;
          isolation: isolate;
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .neon-btn::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(
            135deg,
            rgba(32, 200, 82, 0.8),
            rgba(47, 233, 63, 0.8)
          );
          filter: blur(16px);
          opacity: 0.6;
          z-index: -1;
          transition: opacity 0.25s ease, filter 0.25s ease;
        }

        .neon-btn:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 10px 40px rgba(32, 200, 60, 0.45),
            0 0 60px rgba(20, 209, 45, 0.35);
          filter: brightness(1.1);
        }

        .neon-btn:hover::before {
          opacity: 1;
          filter: blur(22px);
        }

        .neon-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
}
