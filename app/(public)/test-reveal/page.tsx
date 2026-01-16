"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardBack } from "./(components)/Cardback";

type AnimationStage = "idle" | "tearing" | "revealing" | "done";

// ============================================
// Utility functions
// ============================================
const round = (value: number, precision = 3) =>
  parseFloat(value.toFixed(precision));
const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);
const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
) => {
  return round(
    toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
  );
};

// ============================================
// Mock Data
// ============================================
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

// ============================================
// HoloCardFace Component
// ============================================
interface HoloCardFaceProps {
  imageUrl: string;
  alt: string;
  rarity?: string;
  isActive?: boolean;
}

function HoloCardFace({
  imageUrl,
  alt,
  rarity = "common",
  isActive = false,
}: HoloCardFaceProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const updateStyles = useCallback(
    (
      x: number,
      y: number,
      o: number,
      bgX: number,
      bgY: number,
      rotX: number,
      rotY: number
    ) => {
      if (!cardRef.current) return;

      const pointerFromCenter = clamp(
        Math.sqrt((y - 50) * (y - 50) + (x - 50) * (x - 50)) / 50,
        0,
        1
      );

      cardRef.current.style.setProperty("--pointer-x", `${x}%`);
      cardRef.current.style.setProperty("--pointer-y", `${y}%`);
      cardRef.current.style.setProperty(
        "--pointer-from-center",
        `${pointerFromCenter}`
      );
      cardRef.current.style.setProperty("--card-opacity", `${o}`);
      cardRef.current.style.setProperty("--background-x", `${bgX}%`);
      cardRef.current.style.setProperty("--background-y", `${bgY}%`);
      cardRef.current.style.setProperty("--rotate-x", `${rotX}deg`);
      cardRef.current.style.setProperty("--rotate-y", `${rotY}deg`);
    },
    []
  );

  const handleInteract = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!cardRef.current || !isActive) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;

        cardRef.current.classList.add("interacting");

        let clientX: number, clientY: number;
        if ("touches" in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const rect = cardRef.current.getBoundingClientRect();
        const absolute = {
          x: clientX - rect.left,
          y: clientY - rect.top,
        };
        const percent = {
          x: clamp(round((100 / rect.width) * absolute.x)),
          y: clamp(round((100 / rect.height) * absolute.y)),
        };
        const center = {
          x: percent.x - 50,
          y: percent.y - 50,
        };

        const bgX = adjust(percent.x, 0, 100, 37, 63);
        const bgY = adjust(percent.y, 0, 100, 33, 67);
        const rotX = round(-(center.x / 5));
        const rotY = round(center.y / 5);

        updateStyles(percent.x, percent.y, 1, bgX, bgY, rotX, rotY);
      });
    },
    [isActive, updateStyles]
  );

  const handleInteractEnd = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    if (cardRef.current) {
      cardRef.current.classList.remove("interacting");
    }

    requestAnimationFrame(() => {
      updateStyles(50, 50, 0, 50, 50, 0, 0);
    });
  }, [updateStyles]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const normalizedRarity = rarity.toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      ref={cardRef}
      className="holo-face w-full h-full"
      data-rarity={normalizedRarity}
      style={
        {
          "--pointer-x": "50%",
          "--pointer-y": "50%",
          "--card-opacity": "0",
          "--background-x": "50%",
          "--background-y": "50%",
          "--pointer-from-center": "0",
          "--rotate-x": "0deg",
          "--rotate-y": "0deg",
        } as React.CSSProperties
      }
      onMouseMove={handleInteract}
      onMouseLeave={handleInteractEnd}
      onTouchMove={handleInteract}
      onTouchEnd={handleInteractEnd}
    >
      {/* Image wrapper with overflow hidden for rounded corners */}
      {/* Clipped surface */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />

        <div className="holo-face__foil" />
        <div className="holo-face__extra" />
        <div className="holo-face__shine" />
        <div className="holo-face__glare" />
      </div>
    </div>
  );
}
// ============================================
// Main Page Component
// ============================================
export default function PackRevealTest() {
  const [stage, setStage] = useState<AnimationStage>("idle");

  const getCardContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      width: "260px",
      height: "380px",
      zIndex: 15,
      perspective: "1000px",
      filter: `drop-shadow(0 25px 50px ${MOCK_TIER.hexColor}40)`,
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

  const getCardInnerStyles = (): React.CSSProperties => {
    const shouldFlip = stage === "revealing" || stage === "done";

    return {
      position: "relative",
      width: "100%",
      height: "100%",
      transformStyle: "preserve-3d",
      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      transitionDelay: shouldFlip ? "0.5s" : "0s",
      transform: shouldFlip ? "rotateY(180deg)" : "rotateY(0deg)",
    };
  };

  const cardFaceStyles: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    // borderRadius: "12px",
    // overflow: "hidden",
  };

  const getPackTopStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      top: -40,
      left: 0,
      right: 0,
      zIndex: 30,
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      borderRadius: "8px",
      overflow: "hidden",
      transition:
        "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    if (stage === "idle" || stage === "tearing") {
      return {
        ...baseStyles,
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
          0% { transform: translateX(-50%) translateY(-50%); }
          50% { transform: translateX(-50%) translateY(-85%); }
          100% { transform: translateX(-50%) translateY(-50%); }
        }

        .holo-face {
          --pointer-x: 50%;
          --pointer-y: 50%;
          --card-opacity: 0;
          --rotate-x: 0deg;
          --rotate-y: 0deg;
          --background-x: 50%;
          --background-y: 50%;
          --pointer-from-center: 0;
          
          position: relative;
          transform-style: preserve-3d;
          transform: perspective(600px) rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
          transition: transform 0.5s ease-out;
        }

        .holo-face.interacting {
          transition: transform 0.1s ease-out;
        }

        .holo-face__shine {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: var(--card-opacity);
          mix-blend-mode: color-dodge;
          background: radial-gradient(
            farthest-corner circle at var(--pointer-x) var(--pointer-y),
            hsla(0, 0%, 100%, 0.8) 10%,
            hsla(0, 0%, 100%, 0.65) 20%,
            hsla(0, 0%, 0%, 0.5) 90%
          );
          transition: opacity 0.2s ease-out;
          pointer-events: none;
        }

        .holo-face__glare {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: calc(var(--card-opacity) * 0.5);
          mix-blend-mode: overlay;
          background: radial-gradient(
            farthest-corner circle at var(--pointer-x) var(--pointer-y),
            hsla(0, 0%, 100%, 0.5) 0%,
            hsla(0, 0%, 100%, 0.25) 30%,
            hsla(0, 0%, 0%, 0.5) 80%
          );
          transition: opacity 0.2s ease-out;
          pointer-events: none;
        }

        .holo-face[data-rarity="rare"] .holo-face__foil,
        .holo-face[data-rarity="ultra_rare"] .holo-face__foil,
        .holo-face[data-rarity="secret_rare"] .holo-face__foil,
        .holo-face[data-rarity="banger"] .holo-face__foil,
        .holo-face[data-rarity="grail"] .holo-face__foil {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          background-image: 
            repeating-linear-gradient(
              0deg,
              rgb(255, 119, 115) calc(5% * 1),
              rgba(255, 237, 95, 1) calc(5% * 2),
              rgba(168, 255, 95, 1) calc(5% * 3),
              rgba(131, 255, 247, 1) calc(5% * 4),
              rgba(120, 148, 255, 1) calc(5% * 5),
              rgb(216, 117, 255) calc(5% * 6),
              rgb(255, 119, 115) calc(5% * 7)
            ),
            repeating-linear-gradient(
              133deg,
              #0e152e 0%,
              hsl(180, 10%, 60%) 3.8%,
              hsl(180, 29%, 66%) 4.5%,
              hsl(180, 10%, 60%) 5.2%,
              #0e152e 10%,
              #0e152e 12%
            );
          background-size: 400% 800%, 200% 200%;
          background-position: 
            50% calc(50% + (var(--background-y) - 50%) * 3),
            calc(50% + (var(--background-x) - 50%) * -2) 50%;
          background-blend-mode: hue, hard-light;
          filter: brightness(calc((var(--pointer-from-center) * 0.5) + 0.7)) 
                  contrast(1.5) 
                  saturate(1.2);
          mix-blend-mode: color-dodge;
          opacity: calc(var(--card-opacity) * 0.8);
          transition: opacity 0.2s ease-out;
          pointer-events: none;
        }

        .holo-face[data-rarity="grail"] .holo-face__extra {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            125deg,
            rgba(255, 215, 0, 0) 0%,
            rgba(255, 215, 0, 0.3) 40%,
            rgba(255, 215, 0, 0.6) 50%,
            rgba(255, 215, 0, 0.3) 60%,
            rgba(255, 215, 0, 0) 100%
          );
          background-size: 200% 200%;
          background-position: calc(var(--background-x) * 2) calc(var(--background-y) * 2);
          mix-blend-mode: overlay;
          opacity: var(--card-opacity);
          animation: goldShimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        .holo-face[data-rarity="banger"] .holo-face__extra {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            to top,
            rgba(255, 100, 0, 0.4) 0%,
            rgba(255, 50, 0, 0.2) 30%,
            transparent 60%
          );
          mix-blend-mode: screen;
          opacity: var(--card-opacity);
          animation: fireFlicker 0.5s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes goldShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes fireFlicker {
          0% { opacity: 0.5; }
          100% { opacity: 0.8; }
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

        {/* Card with Flip */}
        <div style={getCardContainerStyles()}>
          <div style={getCardInnerStyles()}>
            {/* Back Face */}
            <div style={cardFaceStyles}>
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <CardBack tier={MOCK_TIER} />
              </div>
            </div>

            {/* Front Face with Holo Effect */}
            <div
              style={{
                ...cardFaceStyles,
                transform: "rotateY(180deg)",
              }}
            >
              <HoloCardFace
                imageUrl={MOCK_PRODUCT.imageUrl}
                alt={MOCK_PRODUCT.title}
                rarity={MOCK_TIER.label}
                isActive={stage === "done"}
              />
            </div>
          </div>
        </div>

        {/* Pack Bottom */}
        <div style={getPackBottomStyles()}>
          <img
            src="/images/pack-bottom.png"
            alt="Pack"
            className="w-full h-auto"
          />
        </div>

        {/* Pack Top */}
        <div style={getPackTopStyles()}>
          <img
            src="/images/pack-top.png"
            alt="Pack Top"
            className="w-full h-auto"
          />
        </div>

        {stage === "tearing" && <Particles color={MOCK_TIER.hexColor} />}

        {stage === "idle" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center">
            <span className="text-white text-lg font-semibold drop-shadow-lg animate-pulse">
              Click to Open
            </span>
          </div>
        )}
      </div>

      {/* Result Panel */}
      {stage === "done" && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
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

          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-100">
              {MOCK_PRODUCT.title}
            </h2>
            <p className="text-emerald-400 font-medium">
              ${MOCK_PRODUCT.price} value
            </p>
          </div>

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
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
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
