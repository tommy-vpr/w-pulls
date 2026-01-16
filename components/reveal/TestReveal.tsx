"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type AnimationStage = "idle" | "tearing" | "revealing" | "done";

const MOCK_PRODUCT = {
  title: "Charizard VMAX",
  price: "250.00",
  imageUrl: "/images/charizard.png",
};

const MOCK_TIER = {
  label: "Ultra Rare",
  hexColor: "#a855f7",
  bgColor: "bg-purple-900/30",
  color: "text-purple-400",
  borderColor: "border-purple-700/50",
};

export default function PackRevealTest() {
  const [stage, setStage] = useState<AnimationStage>("idle");

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      width: "260px",
      zIndex: 15,
      filter: `drop-shadow(0 25px 50px ${MOCK_TIER.hexColor}40)`,
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
      background: `radial-gradient(ellipse, ${MOCK_TIER.hexColor}66 0%, transparent 70%)`,
      zIndex: 5,
      filter: "blur(30px)",
      transition: "opacity 0.5s",
      opacity: showGlow ? 1 : 0,
    };
  };

  const stages: AnimationStage[] = ["idle", "tearing", "revealing", "done"];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center overflow-hidden">
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

      {/* Stage Selector */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <p className="text-zinc-500 text-sm">Select Stage</p>
        <div className="flex gap-2">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                stage === s
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pack Name Header */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 text-center z-50">
        <p className="text-zinc-500 text-sm">Opening</p>
        <h1 className="text-2xl font-bold text-zinc-100">Elite Pack</h1>
      </div>

      <div className="relative w-[300px] h-[450px]">
        <div style={getGlowStyles()} />

        {/* Product Card */}
        <div style={getCardStyles()}>
          {MOCK_PRODUCT.imageUrl ? (
            <img
              src={MOCK_PRODUCT.imageUrl}
              alt={MOCK_PRODUCT.title}
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
          <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
            <span className="text-white/50 text-lg font-bold">PACK BOTTOM</span>
          </div>
        </div>

        {/* Pack Top */}
        <div style={getPackTopStyles()}>
          <div className="w-full h-32 bg-gradient-to-br from-violet-500 to-purple-700 rounded-t-lg flex items-center justify-center">
            <span className="text-white/50 text-lg font-bold">PACK TOP</span>
          </div>
        </div>

        {stage === "tearing" && <Particles color={MOCK_TIER.hexColor} />}

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
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Tier Badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border",
              MOCK_TIER.bgColor,
              MOCK_TIER.color,
              MOCK_TIER.borderColor
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {MOCK_TIER.label}
          </span>

          {/* Product Info */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-100">
              {MOCK_PRODUCT.title}
            </h2>
            <p className="text-emerald-400 font-medium">
              ${MOCK_PRODUCT.price} value
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button className="px-5 py-2.5 bg-zinc-800 text-zinc-100 font-medium rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors">
              View Order
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:opacity-90 transition-all">
              Open Another Pack
            </button>
          </div>
        </div>
      )}

      {/* Current Stage Indicator */}
      <div className="absolute bottom-4 left-4 text-zinc-500 text-sm font-mono">
        Stage: {stage}
      </div>
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
