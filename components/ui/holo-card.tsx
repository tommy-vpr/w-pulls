"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

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

interface HoloCardProps {
  imageUrl: string;
  alt: string;
  rarity?: string;
  className?: string;
}

export function HoloCard({
  imageUrl,
  alt,
  rarity = "common",
  className,
}: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [interacting, setInteracting] = useState(false);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 });
  const [background, setBackground] = useState({ x: 50, y: 50 });

  const [seed] = useState(() => ({
    x: Math.random(),
    y: Math.random(),
  }));

  const handleInteract = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!cardRef.current) return;

      setInteracting(true);

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

      setBackground({
        x: adjust(percent.x, 0, 100, 37, 63),
        y: adjust(percent.y, 0, 100, 33, 67),
      });

      setRotate({
        x: round(-(center.x / 3.5)),
        y: round(center.y / 3.5),
      });

      setGlare({
        x: round(percent.x),
        y: round(percent.y),
        o: 1,
      });
    },
    []
  );

  const handleInteractEnd = useCallback(() => {
    setTimeout(() => {
      setInteracting(false);
      setRotate({ x: 0, y: 0 });
      setGlare({ x: 50, y: 50, o: 0 });
      setBackground({ x: 50, y: 50 });
    }, 300);
  }, []);

  const pointerFromCenter = clamp(
    Math.sqrt(
      (glare.y - 50) * (glare.y - 50) + (glare.x - 50) * (glare.x - 50)
    ) / 50,
    0,
    1
  );

  const dynamicStyles = {
    "--pointer-x": `${glare.x}%`,
    "--pointer-y": `${glare.y}%`,
    "--pointer-from-center": pointerFromCenter,
    "--pointer-from-top": glare.y / 100,
    "--pointer-from-left": glare.x / 100,
    "--card-opacity": glare.o,
    "--rotate-x": `${rotate.x}deg`,
    "--rotate-y": `${rotate.y}deg`,
    "--background-x": `${background.x}%`,
    "--background-y": `${background.y}%`,
    "--seedx": seed.x,
    "--seedy": seed.y,
  } as React.CSSProperties;

  const normalizedRarity = rarity.toLowerCase().replace(/\s+/g, "_");

  return (
    <>
      <style>{`
        .holo-card {
          --pointer-x: 50%;
          --pointer-y: 50%;
          --card-opacity: 0;
          --rotate-x: 0deg;
          --rotate-y: 0deg;
          --background-x: 50%;
          --background-y: 50%;
          --pointer-from-center: 0;
          --pointer-from-top: 0.5;
          --pointer-from-left: 0.5;
        }

        .holo-card__rotator {
          transform: perspective(600px) rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }

        .holo-card:not(.interacting) .holo-card__rotator {
          transition: transform 0.5s ease-out;
        }

        .holo-card__shine {
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
        }

        .holo-card__glare {
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
        }

        .holo-card[data-rarity="rare"] .holo-card__foil,
        .holo-card[data-rarity="ultra_rare"] .holo-card__foil,
        .holo-card[data-rarity="secret_rare"] .holo-card__foil,
        .holo-card[data-rarity="banger"] .holo-card__foil,
        .holo-card[data-rarity="grail"] .holo-card__foil {
          position: absolute;
          inset: 0;
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
          background-size: 200% 700%, 300% 100%;
          background-position: 
            0% calc(var(--background-y) * 1.5),
            calc(var(--background-x) * -1) 0%;
          background-blend-mode: hue, hard-light;
          filter: brightness(calc((var(--pointer-from-center) * 0.5) + 0.7)) 
                  contrast(1.5) 
                  saturate(1.2);
          mix-blend-mode: color-dodge;
          opacity: calc(var(--card-opacity) * 0.8);
          transition: opacity 0.2s ease-out;
        }

        .holo-card[data-rarity="grail"] .holo-card__extra {
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
        }

        .holo-card[data-rarity="banger"] .holo-card__extra {
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

      <div
        ref={cardRef}
        className={cn(
          "holo-card relative",
          interacting && "interacting",
          className
        )}
        data-rarity={normalizedRarity}
        style={dynamicStyles}
        onMouseMove={handleInteract}
        onMouseLeave={handleInteractEnd}
        onTouchMove={handleInteract}
        onTouchEnd={handleInteractEnd}
      >
        <div className="holo-card__rotator">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-cover"
            />
            <div className="holo-card__foil rounded-lg" />
            <div className="holo-card__extra rounded-lg" />
            <div className="holo-card__shine rounded-lg" />
            <div className="holo-card__glare rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );
}
