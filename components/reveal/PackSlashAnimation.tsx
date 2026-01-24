"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { SerializedProduct } from "@/types/product";
import { getTierConfig } from "@/lib/tier-config";
import { BuybackModal } from "./BuybackModal";

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
  toMax: number,
) => {
  return round(
    toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin),
  );
};

// ============================================
// Props
// ============================================
interface PackRevealAnimationProps {
  // product: SerializedProduct;
  tier: string;
  packName: string;
  orderId: string;
  packTopImage?: string;
  packBottomImage?: string;
}

// ============================================
// Buyback Quote Interface
// ============================================
interface BuybackQuote {
  orderItemId: string;
  productTitle: string;
  productImageUrl: string | null;
  productValue: number;
  buybackRate: number;
  buybackAmount: number;
  quoteToken: string;
  expiresAt: string;
  expiresInSeconds: number;
}

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
      rotY: number,
    ) => {
      if (!cardRef.current) return;

      const pointerFromCenter = clamp(
        Math.sqrt((y - 50) * (y - 50) + (x - 50) * (x - 50)) / 50,
        0,
        1,
      );

      cardRef.current.style.setProperty("--pointer-x", `${x}%`);
      cardRef.current.style.setProperty("--pointer-y", `${y}%`);
      cardRef.current.style.setProperty(
        "--pointer-from-center",
        `${pointerFromCenter}`,
      );
      cardRef.current.style.setProperty("--card-opacity", `${o}`);
      cardRef.current.style.setProperty("--background-x", `${bgX}%`);
      cardRef.current.style.setProperty("--background-y", `${bgY}%`);
      cardRef.current.style.setProperty("--rotate-x", `${rotX}deg`);
      cardRef.current.style.setProperty("--rotate-y", `${rotY}deg`);
    },
    [],
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
    [isActive, updateStyles],
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
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
        <div className="holo-face__foil" />
        <div className="holo-face__extra" />
        <div className="holo-face__shine" />
        <div className="holo-face__glare" />
      </div>
    </div>
  );
}

// ============================================
// CardBack Component
// ============================================
interface CardBackProps {
  tier: {
    label: string;
    hexColor: string;
  };
}

function CardBack({ tier }: CardBackProps) {
  return (
    <div
      className="w-full h-full rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tier.hexColor}90 0%, ${tier.hexColor}40 50%, ${tier.hexColor}90 100%)`,
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${80 + i * 30}px`,
                height: `${80 + i * 30}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <Sparkles className="h-16 w-16 text-white/50" />
      </div>
    </div>
  );
}

// ============================================
// SlashEffect Component
// ============================================
function SlashEffect() {
  return (
    <>
      <style>{`
        @keyframes slashCut {
          0% { left: -10%; }
          100% { left: 110%; }
        }
      `}</style>
      <div
        className="absolute h-[2px] w-28"
        style={{
          background: "linear-gradient(90deg, transparent, white, transparent)",
          animation: "slashCut 0.25s linear forwards",
        }}
      />
    </>
  );
}

// ============================================
// Particles Component
// ============================================
function Particles({ color = "#fff" }: { color?: string }) {
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

// ============================================
// SwipeToOpenButton Component
// ============================================
interface SwipeToOpenButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  accentColor?: string;
}

function SwipeToOpenButton({
  onComplete,
  disabled = false,
  accentColor = "#8b5cf6",
}: SwipeToOpenButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startX = useRef<number>(0);
  const thumbWidth = 56;

  const getClientX = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
  ): number => {
    if ("touches" in e && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return e.changedTouches[0].clientX;
    }
    if ("clientX" in e) {
      return e.clientX;
    }
    return 0;
  };

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled || isComplete) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startX.current = getClientX(e);
    },
    [disabled, isComplete],
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !trackRef.current || isComplete) return;

      const currentX = getClientX(e);
      const trackWidth = trackRef.current.offsetWidth - thumbWidth;
      const deltaX = currentX - startX.current;
      const newProgress = Math.max(0, Math.min(1, deltaX / trackWidth));

      setProgress(newProgress);
    },
    [isDragging, isComplete],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    if (progress >= 0.9) {
      setProgress(1);
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 200);
    } else {
      setProgress(0);
    }

    setIsDragging(false);
  }, [isDragging, progress, onComplete]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const trackWidth = trackRef.current?.offsetWidth || 280;
  const thumbPosition = progress * (trackWidth - thumbWidth);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative w-[280px] h-14 rounded-full overflow-hidden select-none",
        "bg-zinc-800/80 backdrop-blur-sm border border-zinc-700/50",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={{
        boxShadow: `0 0 20px ${accentColor}20`,
        touchAction: "none",
      }}
      onMouseDown={(e) => e.preventDefault()}
      onTouchStart={(e) => e.preventDefault()}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
        style={{
          width: `${thumbPosition + thumbWidth}px`,
          background: `linear-gradient(90deg, ${accentColor}40 0%, ${accentColor}60 100%)`,
        }}
      />

      {/* Text label */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: 1 - progress,
        }}
      >
        <span className="text-zinc-400 text-sm font-medium tracking-wide flex items-center gap-2">
          Swipe to Open
          <ChevronRight className="w-4 h-4 animate-pulse" />
        </span>
      </div>

      {/* Success text */}
      {isComplete && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-sm font-medium">Opening!</span>
        </div>
      )}

      {/* Draggable thumb */}
      <div
        className={cn(
          "absolute top-1 bottom-1 w-12 rounded-full cursor-grab active:cursor-grabbing",
          "flex items-center justify-center select-none",
          "transition-transform duration-75",
          isComplete && "scale-110",
        )}
        style={{
          left: `${4 + thumbPosition}px`,
          background: isComplete
            ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`
            : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}aa 100%)`,
          boxShadow: `0 4px 15px ${accentColor}50`,
          touchAction: "none",
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        draggable={false}
        tabIndex={-1}
      >
        {isComplete ? (
          <Sparkles className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Shimmer effect */}
      {!isDragging && !isComplete && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}15 50%, transparent 100%)`,
            animation: "shimmer 2s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Quote Timer Component
// ============================================
function QuoteTimer({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  onExpired: () => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const remaining = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / 1000,
    );
    return Math.max(0, remaining);
  });

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpired]);

  if (timeRemaining <= 0) return null;

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const isUrgent = timeRemaining <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono",
        isUrgent
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      )}
    >
      <Wallet className="w-3 h-3" />
      <span>
        Sell back: {mins}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export function PackSlashAnimation({
  // product,
  tier,
  packName,
  orderId,
  packTopImage = "/images/pack-top.png",
  packBottomImage = "/images/pack-bottom.png",
}: PackRevealAnimationProps) {
  const router = useRouter();
  const [stage, setStage] = useState<AnimationStage>("idle");
  const tierConfig = getTierConfig(tier);

  // Sound Effect Tearing
  const tearSoundRef = useRef<HTMLAudioElement | null>(null);
  const winningSoundRef = useRef<HTMLAudioElement | null>(null);

  const [revealedProduct, setRevealedProduct] =
    useState<SerializedProduct | null>(null);
  const [revealedOrderItemId, setRevealedOrderItemId] = useState<string | null>(
    null,
  );

  const [isRevealing, setIsRevealing] = useState(false);

  // Buyback state
  const [showBuybackModal, setShowBuybackModal] = useState(false);
  const [buybackQuote, setBuybackQuote] = useState<BuybackQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [buybackExpired, setBuybackExpired] = useState(false);
  const [buybackCompleted, setBuybackCompleted] = useState(false);

  // Preload audio on mount
  useEffect(() => {
    tearSoundRef.current = new Audio("/audio/tearing-effect.mp3");
    tearSoundRef.current.preload = "auto";
    tearSoundRef.current.volume = 0.5;

    winningSoundRef.current = new Audio("/audio/winning-sound.mp3");
    winningSoundRef.current.preload = "auto";
    winningSoundRef.current.volume = 0.5;
  }, []);

  // Play when stage becomes "tearing"
  useEffect(() => {
    if (stage === "tearing" && tearSoundRef.current) {
      tearSoundRef.current.currentTime = 0;
      tearSoundRef.current.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    }
  }, [stage]);

  // Play winning sound when stage becomes "revealing"
  useEffect(() => {
    if (stage === "done" && winningSoundRef.current) {
      winningSoundRef.current.currentTime = 0;
      winningSoundRef.current.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
    }
  }, [stage]);

  // Fetch buyback quote after reveal
  const fetchBuybackQuote = useCallback(async (orderItemId: string) => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch("/api/buyback/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId }),
      });
      const data = await res.json();

      if (data.success && data.quote) {
        setBuybackQuote(data.quote);
      }
    } catch (error) {
      console.error("Failed to fetch buyback quote:", error);
    } finally {
      setIsLoadingQuote(false);
    }
  }, []);

  const startAnimation = useCallback(async () => {
    if (stage !== "idle" || isRevealing) return;

    setIsRevealing(true);

    const res = await fetch("/api/packs/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Reveal failed:", data);
      setIsRevealing(false);
      return;
    }

    if (data.revealed || data.alreadyRevealed) {
      setRevealedProduct(data.product);
      // Get the orderItemId from the response
      if (data.orderItemId) {
        setRevealedOrderItemId(data.orderItemId);
      }
    } else {
      console.error("Invalid reveal response", data);
      setIsRevealing(false);
      return;
    }

    if (data.alreadyRevealed) {
      setRevealedProduct(data.product);
      setStage("done");
      setIsRevealing(false);
      // Don't fetch quote for already revealed
      return;
    }

    // ✅ Only animate AFTER server confirms reveal
    setStage("tearing");

    setTimeout(() => setStage("revealing"), 500);
    setTimeout(() => {
      setStage("done");
      setIsRevealing(false);
      // Fetch buyback quote after reveal animation completes
      if (data.orderItemId) {
        fetchBuybackQuote(data.orderItemId);
      }
    }, 2000);
  }, [stage, isRevealing, orderId, fetchBuybackQuote]);

  const handleViewOrder = () => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleOpenAnother = () => {
    router.push("/packs");
  };

  const handleBuyback = async () => {
    if (!buybackQuote || !revealedOrderItemId) return;

    const res = await fetch("/api/buyback/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderItemId: revealedOrderItemId,
        quoteToken: buybackQuote.quoteToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Buyback failed");
    }

    setBuybackCompleted(true);
    setShowBuybackModal(false);
  };

  const handleQuoteExpired = () => {
    setBuybackExpired(true);
    setBuybackQuote(null);
  };

  const getCardContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      width: "260px",
      height: "380px",
      zIndex: 15,
      perspective: "1000px",
      filter: `drop-shadow(0 25px 50px ${tierConfig.hexColor}40)`,
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

      {/* Pack Name Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-50">
        <p className="text-zinc-500 text-sm">Opening</p>
        <h1 className="text-2xl font-bold text-zinc-100">{packName}</h1>
      </div>

      <div className="relative w-[300px] h-[450px]">
        <div style={getGlowStyles()} />

        {/* Card with Flip */}
        <div style={getCardContainerStyles()}>
          <div style={getCardInnerStyles()}>
            {/* Back Face */}
            <div style={cardFaceStyles}>
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <CardBack tier={tierConfig} />
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
                imageUrl={
                  revealedProduct?.imageUrl || "/images/placeholder-card.png"
                }
                alt={revealedProduct?.title ?? ""}
                rarity={tier}
                isActive={stage === "done"}
              />
            </div>
          </div>
        </div>

        {/* Slash Effect */}
        {stage === "tearing" && (
          <div
            className="absolute left-0 right-0 z-[25] pointer-events-none"
            style={{ top: -1 }}
          >
            <SlashEffect />
          </div>
        )}

        {/* Pack Bottom */}
        <div style={getPackBottomStyles()}>
          <img
            src={packBottomImage}
            alt="Pack"
            className="w-full h-auto select-none"
            draggable={false}
          />
        </div>

        {/* Pack Top */}
        <div style={getPackTopStyles()}>
          <img
            src={packTopImage}
            alt="Pack Top"
            className="w-full h-auto select-none"
            draggable={false}
          />
        </div>

        {stage === "tearing" && <Particles color="#fff" />}
      </div>

      {/* Swipe to Open Button */}
      {stage === "idle" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <SwipeToOpenButton
            onComplete={startAnimation}
            accentColor={tierConfig.hexColor}
          />
        </div>
      )}

      {/* Result Panel */}
      {stage === "done" && revealedProduct && !buybackCompleted && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
          {/* Buyback Timer */}
          {buybackQuote && !buybackExpired && (
            <QuoteTimer
              expiresAt={buybackQuote.expiresAt}
              onExpired={handleQuoteExpired}
            />
          )}

          <span
            className={cn(
              "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border",
              tierConfig.bgColor,
              tierConfig.color,
              tierConfig.borderColor,
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {tierConfig.label}
          </span>

          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-100">
              {revealedProduct.title}
            </h2>
            <p className="text-emerald-400 font-medium">
              ${Number(revealedProduct.price).toFixed(2)} value
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex gap-3">
              <button
                onClick={handleViewOrder}
                className="
                  cursor-pointer relative px-6 py-3
                  font-semibold text-violet-400
                  bg-zinc-950
                  border border-violet-500/40
                  rounded-md
                  shadow-[0_0_25px_-10px_rgba(168,85,247,0.9)]
                  hover:bg-violet-500
                  hover:shadow-[0_0_40px_-8px_rgba(168,85,247,1)]
                  hover:text-white
                  transition-all duration-300
              "
              >
                View Order
              </button>
              <button
                onClick={handleOpenAnother}
                className="
                  cursor-pointer relative px-6 py-3
                  font-semibold text-teal-400
                  bg-zinc-950
                  border border-teal-500/40
                  rounded-md
                  shadow-[0_0_25px_-10px_rgba(20,184,166,0.9)]
                  hover:bg-teal-500
                  hover:shadow-[0_0_40px_-8px_rgba(20,184,166,1)]
                  hover:text-white
                  transition-all duration-300
              "
              >
                Open Another Pack
              </button>
            </div>

            {/* Buyback Button */}
            {buybackQuote && !buybackExpired && (
              <button
                onClick={() => setShowBuybackModal(true)}
                className="cursor-pointer relative w-full px-6 py-3 font-semibold text-emerald-400 bg-zinc-950 border border-emerald-500/40 rounded-md shadow-[0_0_25px_-10px_rgba(16,185,129,0.9)] hover:bg-emerald-500 hover:shadow-[0_0_40px_-8px_rgba(16,185,129,1)] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Sell Back for ${(buybackQuote.buybackAmount / 100).toFixed(2)}
              </button>
            )}

            {isLoadingQuote && (
              <div className="text-zinc-500 text-sm">
                Loading buyback offer...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buyback Success */}
      {buybackCompleted && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-1">
              ${(buybackQuote?.buybackAmount ?? 0 / 100).toFixed(2)} Added to
              Wallet!
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Withdraw anytime from your Wallet page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard/wallet")}
                className="cursor-pointer px-4 py-2 bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 transition-colors"
              >
                Go to Wallet
              </button>
              <button
                onClick={handleOpenAnother}
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors"
              >
                Open Another Pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyback Modal */}
      {buybackQuote && (
        <BuybackModal
          isOpen={showBuybackModal}
          onClose={() => setShowBuybackModal(false)}
          onConfirm={handleBuyback}
          productTitle={buybackQuote.productTitle}
          productImageUrl={buybackQuote.productImageUrl}
          productValue={buybackQuote.productValue}
          buybackAmount={buybackQuote.buybackAmount}
          buybackRate={buybackQuote.buybackRate}
          expiresInSeconds={Math.floor(
            (new Date(buybackQuote.expiresAt).getTime() - Date.now()) / 1000,
          )}
          accentColor="#10b981"
        />
      )}
    </div>
  );
}
