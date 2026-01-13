"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, Crown, Flame, Star, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackConfig } from "@/lib/packs/config";
import { cn } from "@/lib/utils";
import "./pack-card.css";
import { PurchaseButton } from "./purchase-button";
import { useRouter } from "next/navigation";

interface PackCardProps {
  pack: PackConfig;
}

const packStyles: Record<
  string,
  {
    gradient: string;
    glowColor: string;
    icon: React.ReactNode;
    accentColor: string;
  }
> = {
  starter: {
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #7c3aed 100%)",
    glowColor: "rgba(139, 92, 246, 0.5)",
    icon: <Flame className="h-8 w-8 text-white/90" />,
    accentColor: "#a78bfa",
  },
  premium: {
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #0284c7 100%)",
    glowColor: "rgba(14, 165, 233, 0.4)",
    icon: <Gem className="h-8 w-8 text-white/90" />,
    accentColor: "#38bdf8",
  },
  elite: {
    gradient: "linear-gradient(135deg, #71717a 0%, #3f3f46 50%, #52525b 100%)",
    glowColor: "rgba(113, 113, 122, 0.4)",
    icon: <Star className="h-8 w-8 text-white/90" />,
    accentColor: "#a1a1aa",
  },
  legendary: {
    gradient:
      "linear-gradient(135deg, #fbbf24 0%, #d97706 30%, #f59e0b 60%, #fcd34d 100%)",
    glowColor: "rgba(251, 191, 36, 0.5)",
    icon: <Crown className="h-8 w-8 text-white/90" />,
    accentColor: "#fcd34d",
  },
};

export function PackCard({ pack }: PackCardProps) {
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const style = packStyles[pack.id] || packStyles.starter;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 10;
    const tiltY = (centerX - x) / 10;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });

      const data = await res.json();

      // Handle unauthorized - redirect to auth
      if (res.status === 401 || data.redirect) {
        router.push(data.redirect || "/auth?callbackUrl=/packs");
        return;
      }

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pack-card-wrapper">
      <div
        ref={cardRef}
        className={cn("pack-card", isHovering && "is-hovering")}
        style={
          {
            "--tilt-x": `${tilt.x}deg`,
            "--tilt-y": `${tilt.y}deg`,
            "--card-gradient": style.gradient,
            "--glow-color": style.glowColor,
            "--accent-color": style.accentColor,
          } as React.CSSProperties
        }
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Holographic Overlay */}
        <div className="pack-card-holo" />

        {/* Glitter Effect */}
        <div className="pack-card-glitter" />

        {/* Shine Effect */}
        <div className="pack-card-shine" />

        {/* Content */}
        <div className="pack-card-content">
          {/* Top Badge */}
          <div className="pack-card-badge">
            <span>
              {pack.id === "legendary" ? "👑 LEGENDARY" : pack.id.toUpperCase()}
            </span>
          </div>

          {/* Icon */}
          <div className="pack-card-icon">{style.icon}</div>

          {/* Pack Name */}
          <h3 className="pack-card-title">{pack.name}</h3>

          {/* Price */}
          <div className="pack-card-price">{pack.displayPrice}</div>

          {/* Description */}
          <p className="pack-card-description">{pack.description}</p>

          {/* Odds Preview */}
          <div className="pack-card-odds">
            <div className="odds-bar">
              <div
                className="odds-fill odds-rare"
                style={{
                  width: `${
                    pack.odds.RARE +
                    pack.odds.ULTRA_RARE +
                    pack.odds.SECRET_RARE +
                    pack.odds.BANGER +
                    pack.odds.GRAIL
                  }%`,
                }}
              />
            </div>
            <span className="odds-label">
              {(
                pack.odds.RARE +
                pack.odds.ULTRA_RARE +
                pack.odds.SECRET_RARE +
                pack.odds.BANGER +
                pack.odds.GRAIL
              ).toFixed(1)}
              % Rare+
            </span>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="pack-card-bottom">
          <svg
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            className="pack-card-wave"
          >
            <path
              d="M0 20 Q 25 0, 50 10 T 100 5 L 100 20 Z"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>
        </div>
      </div>

      {/* Purchase Button */}
      <PurchaseButton
        onClick={handlePurchase}
        loading={loading}
        accentColor={style.accentColor}
      />
    </div>
  );
}
