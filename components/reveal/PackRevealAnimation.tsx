"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SerializedProduct } from "@/types/product";
import { getTierConfig } from "@/lib/tier-config";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

type AnimationStage = "idle" | "tearing" | "revealing" | "done";

interface PackRevealAnimationProps {
  product: SerializedProduct;
  tier: string;
  packName: string;
  packTopImage?: string;
  packBottomImage?: string;
  orderId?: string;
}

export function PackRevealAnimation({
  product,
  tier,
  packName,
  packTopImage = "/images/pack-top.png",
  packBottomImage = "/images/pack-bottom.png",
  orderId,
}: PackRevealAnimationProps) {
  const router = useRouter();
  const [stage, setStage] = useState<AnimationStage>("idle");
  const tierConfig = getTierConfig(tier);

  const startAnimation = (): void => {
    if (stage !== "idle") return;

    setStage("tearing");

    setTimeout(() => {
      setStage("revealing");
    }, 500);

    setTimeout(() => {
      setStage("done");
    }, 2000);
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/dashboard/orders/${orderId}`);
    }
  };

  const handleOpenAnother = () => {
    router.push("/packs");
  };

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      width: "260px",
      zIndex: 15,
      filter: `drop-shadow(0 25px 50px ${tierConfig.hexColor}40)`,
      willChange: "transform",
    };

    if (stage === "idle" || stage === "tearing") {
      return {
        ...baseStyles,
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        opacity: 1,
      };
    }

    return {
      ...baseStyles,
      top: "50%",
      transform: "translateX(-50%) translateY(-50%)",
      opacity: 1,
      animation: "cardReveal 1.5s ease-in-out forwards",
    };
  };

  const getPackTopStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      willChange: "transform, opacity",
    };

    if (stage === "idle") {
      return {
        ...baseStyles,
        transform: "translateY(0) rotate(0deg)",
        opacity: 1,
      };
    }

    return {
      ...baseStyles,
      transform: "translateY(-150px) rotate(-5deg) scale(1.1)",
      opacity: 0,
    };
  };

  const getPackBottomStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      zIndex: 20,
      borderRadius: "8px",
      overflow: "hidden",
      transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      willChange: "transform, opacity",
    };

    if (stage === "idle" || stage === "tearing") {
      return {
        ...baseStyles,
        transform: "translateY(0)",
        opacity: 1,
      };
    }

    return {
      ...baseStyles,
      transform: "translateY(120%)",
      opacity: 0,
    };
  };

  const getGlowStyles = (): React.CSSProperties => {
    const showGlow = stage === "revealing" || stage === "done";

    return {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "200px",
      height: "300px",
      background: `radial-gradient(ellipse, ${tierConfig.hexColor}66 0%, transparent 70%)`,
      zIndex: 5,
      filter: "blur(30px)",
      transition: "opacity 0.5s",
      opacity: showGlow ? 1 : 0,
    };
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <style>{`
        @keyframes cardReveal {
          0% {
            transform: translateX(-50%) translateY(-50%);
          }
          50% {
            transform: translateX(-50%) translateY(-85%);
          }
          100% {
            transform: translateX(-50%) translateY(-50%);
          }
        }
      `}</style>

      {/* Pack Name Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-50">
        <p className="text-zinc-500 text-sm">Opening</p>
        <h1 className="text-2xl font-bold text-zinc-100">{packName}</h1>
      </div>

      <div
        className="relative w-[300px] h-[450px] cursor-pointer"
        onClick={startAnimation}
      >
        <div style={getGlowStyles()} />

        {/* Product Card */}
        <div style={getCardStyles()}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-auto rounded-xl"
            />
          ) : (
            <div className="w-full aspect-[2/3] bg-zinc-800 rounded-xl flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Pack Bottom */}
        <div style={getPackBottomStyles()}>
          <img
            src={packBottomImage}
            alt="Pack"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Pack Top */}
        <div style={getPackTopStyles()}>
          <img src={packTopImage} alt="Pack Top" className="w-full h-auto" />
        </div>

        {stage === "tearing" && <Particles color={tierConfig.hexColor} />}

        {stage === "idle" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-[1px]">
            <span className="text-white text-lg font-semibold drop-shadow-lg animate-pulse">
              Click to Open
            </span>
          </div>
        )}
      </div>

      {/* Result Panel */}
      {stage === "done" && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Tier Badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border",
              tierConfig.bgColor,
              tierConfig.color,
              tierConfig.borderColor
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {tierConfig.label}
          </span>

          {/* Product Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-100">{product.title}</h2>
            <p className="text-emerald-400 font-medium">
              ${Number(product.price).toFixed(2)} value
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            {orderId && (
              <button
                onClick={handleViewOrder}
                className="px-5 py-2.5 bg-zinc-800 text-zinc-100 font-medium rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                View Order
              </button>
            )}
            <button
              onClick={handleOpenAnother}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:opacity-90 transition-all"
            >
              Open Another Pack
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Particles({ color = "#f97316" }: { color?: string }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.2,
  }));

  return (
    <>
      <style>{`
        @keyframes particleFly {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
      <div className="absolute top-0 left-0 right-0 h-24 z-[35] pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: particle.left,
              animationName: "particleFly",
              animationDuration: "0.8s",
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards",
              animationDelay: `${particle.delay}s`,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    </>
  );
}
