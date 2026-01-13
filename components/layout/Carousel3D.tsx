"use client";

import React from "react";
import "./carousel-3d.css";

interface Carousel3DProps {
  images: string[];
  width?: number;
  height?: number;
  depth?: number;
  duration?: number;
  beamColor?: string;
  cardBack?: string;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({
  images,
  width = 140,
  height = 200,
  depth = 280,
  duration = 20,
  beamColor = "#44adf9",
  cardBack = "/images/card-back.png",
}) => {
  const angle = 360 / images.length;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center carousel-wrapper
      bg-radial from-slate-900 to-bg-accent-foreground"
    >
      {/* TILT WRAPPER (camera angle) */}
      <div
        className="relative z-20"
        style={{
          transform: "rotateX(0)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* ROTATING CAROUSEL */}
        <div
          className="carousel-rotate relative z-20"
          style={{ animationDuration: `${duration}s` }}
        >
          <div
            className="relative"
            style={{ width, height, transformStyle: "preserve-3d" }}
          >
            {images.map((src, index) => (
              <span
                key={`${src}-${index}`}
                className="absolute inset-0 carousel-item"
                style={{
                  transform: `rotateY(${
                    index * angle
                  }deg) translateZ(${depth}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* === PLASTIC CASE WRAPPER === */}
                <div
                  className="absolute rounded-2xl"
                  style={{
                    inset: -8, // padding around the card
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Case Front Face */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      transform: "translateZ(1.5px)",
                      backfaceVisibility: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)",
                      backdropFilter: "",
                      border: "2px solid rgba(255,255,255,0.2)",
                      boxShadow: `
            inset 0 1px 1px rgba(255,255,255,0.3),
            inset 0 -1px 1px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.3)
          `,
                    }}
                  >
                    {/* Top glare reflection */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
                        borderRadius: "16px 16px 50% 50%",
                      }}
                    />

                    {/* Diagonal glare streak */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: "5%",
                        left: "-20%",
                        width: "50%",
                        height: "200%",
                        background:
                          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
                        transform: "rotate(-20deg)",
                      }}
                    />

                    {/* Holographic shimmer effect */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 20%, rgba(255,100,100,0.1) 30%, rgba(100,255,100,0.1) 50%, rgba(100,100,255,0.1) 70%, transparent 80%)",
                        mixBlendMode: "overlay",
                      }}
                    />

                    {/* Grading label area at bottom */}
                    {/* <div
                      className="absolute bottom-2 left-2 right-2 h-6 rounded-md flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)",
                        border: "2px solid rgba(255,255,255,0.1)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <span className="text-[8px] font-bold tracking-widest text-white/90 uppercase">
                        W-Pull
                      </span>
                    </div> */}
                  </div>

                  {/* Case Back Face */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      transform: "rotateY(180deg) translateZ(1.5px)",
                      backfaceVisibility: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                      backdropFilter: "",
                      border: "2px solid rgba(255,255,255,0.15)",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)",
                    }}
                  />

                  {/* Case Left Edge */}
                  <div
                    className="absolute h-full"
                    style={{
                      width: 3,
                      left: 0,
                      transform: "rotateY(-90deg) translateZ(1.5px)",
                      transformOrigin: "left center",
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      borderTop: "2px solid rgba(255,255,255,0.3)",
                      borderBottom: "2px solid rgba(255,255,255,0.1)",
                    }}
                  />

                  {/* Case Right Edge */}
                  <div
                    className="absolute h-full"
                    style={{
                      width: 3,
                      right: 0,
                      transform: "rotateY(90deg) translateZ(1.5px)",
                      transformOrigin: "right center",
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                      borderTop: "2px solid rgba(255,255,255,0.3)",
                      borderBottom: "2px solid rgba(255,255,255,0.1)",
                    }}
                  />

                  {/* Case Top Edge */}
                  <div
                    className="absolute w-full"
                    style={{
                      height: 3,
                      top: 0,
                      transform: "rotateX(90deg) translateZ(1.5px)",
                      transformOrigin: "center top",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                      borderLeft: "2px solid rgba(255,255,255,0.2)",
                      borderRight: "2px solid rgba(255,255,255,0.2)",
                    }}
                  />

                  {/* Case Bottom Edge */}
                  <div
                    className="absolute w-full"
                    style={{
                      height: 3,
                      bottom: 0,
                      transform: "rotateX(-90deg) translateZ(1.5px)",
                      transformOrigin: "center bottom",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 100%)",
                      borderLeft: "2px solid rgba(255,255,255,0.1)",
                      borderRight: "2px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>

                {/* === THE ACTUAL CARD (inside the case) === */}
                {/* Front face */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-xl object-cover"
                  style={{
                    transform: "translateZ(0.5px)",
                    boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Back face */}
                <img
                  src={cardBack}
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-xl object-cover"
                  style={{
                    transform: "rotateY(180deg) translateZ(0.5px)",
                    backfaceVisibility: "hidden",
                    boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* LIGHT BEAM BASE - Below carousel */}
      <div
        className="absolute flex justify-center left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          bottom: "-20%",
          width: depth * 2.5,
          height: depth * 3,
          transformStyle: "flat",
        }}
      >
        <img
          src="/images/light-base-bottom.webp"
          alt=""
          className="w-3/4 h-3/4 object-contain mt-auto"
        />

        {/* <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "25%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `radial-gradient(circle, white 0%, ${beamColor} 50%, transparent 70%)`,
            boxShadow: `0 0 60px ${beamColor}`,
          }}
        /> */}

        {/* Bottom beam particles - shorter distance */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="beam-particle-short"
            style={{
              width: 3 + Math.random() * 6,
              height: 3 + Math.random() * 6,
              bottom: "40%",
              left: `${35 + Math.random() * 30}%`,
              background: `radial-gradient(circle, white, ${beamColor})`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${1 + Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* LIGHT BEAM TOP - Above carousel (flipped) */}
      <div
        className="absolute flex justify-center left-1/2 z-10 pointer-events-none"
        style={{
          top: "-20%",
          width: depth * 2.5,
          height: depth * 3,
          transform: "translateX(-50%) scaleY(-1)",
          transformStyle: "flat",
        }}
      >
        <img
          src="/images/light-base.webp"
          alt=""
          className="w-3/4 h-3/4 object-contain mt-auto"
        />

        {/* <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "25%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `radial-gradient(circle, white 0%, ${beamColor} 50%, transparent 70%)`,
            boxShadow: `0 0 60px ${beamColor}`,
          }}
        /> */}

        {[...Array(16)].map((_, i) => (
          <div
            key={`top-${i}`}
            className="beam-particle"
            style={{
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              bottom: "20%",
              left: `${35 + Math.random() * 30}%`,
              background: `radial-gradient(circle, white, ${beamColor})`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
