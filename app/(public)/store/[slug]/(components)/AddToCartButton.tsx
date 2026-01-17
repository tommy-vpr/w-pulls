"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart/cart.store";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (disabled || state !== "idle") return;

    setState("loading");

    addItem(productId, 1);

    setState("success");

    setTimeout(() => setState("idle"), 2000);
  };

  const isDisabled = disabled || state === "loading";

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={cn(
        "group cursor-pointer relative w-full py-4 px-6",
        "font-mono font-bold text-lg uppercase tracking-wider",
        "border transition-all duration-150 overflow-hidden",
        "flex items-center justify-center gap-3",
        isDisabled
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      style={{
        background:
          state === "success"
            ? "linear-gradient(180deg, rgba(60,200,80,.2), rgba(30,150,50,.15))"
            : disabled
            ? "linear-gradient(180deg, rgba(40,40,40,.95), rgba(20,20,20,.95))"
            : "linear-gradient(180deg, rgba(12,28,15,.95), rgba(6,16,9,.95))",
        borderColor:
          state === "success"
            ? "rgba(120,255,124,.7)"
            : disabled
            ? "rgba(100,100,100,.4)"
            : "rgba(120,255,124,.45)",
        color: state === "success" ? "#78ff7c" : disabled ? "#666" : "#78ff7c",
        boxShadow:
          state === "success"
            ? "inset 0 0 20px rgba(120,255,124,.25), 0 0 20px rgba(120,255,124,.3)"
            : disabled
            ? "none"
            : "inset 0 0 12px rgba(120,255,124,.18), 0 6px 16px rgba(0,0,0,.35)",
        textShadow:
          state === "success"
            ? "0 0 8px rgba(120,255,124,.6)"
            : disabled
            ? "none"
            : "0 0 6px rgba(120,255,124,.4)",
      }}
    >
      {/* Hover Neon Glow */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-[-6px] opacity-0 transition-opacity duration-200",
          !isDisabled && state === "idle" && "group-hover:opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(120,255,124,.75), transparent 60%)",
          filter: "blur(18px)",
          zIndex: 0,
        }}
      />

      {/* Shimmer Animation */}
      {state === "idle" && !disabled && (
        <span
          className="absolute inset-0 -translate-x-full animate-crt-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(120,255,124,.08) 50%, transparent 100%)",
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-3">
        {/* Button Content */}
        {state === "loading" ? (
          <>
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ filter: "drop-shadow(0 0 4px rgba(120,255,124,.5))" }}
            />
            <span>PROCESSING...</span>
          </>
        ) : state === "success" ? (
          <>
            <Check
              className="w-5 h-5"
              style={{ filter: "drop-shadow(0 0 4px rgba(120,255,124,.5))" }}
            />
            <span>ADDED TO CART!</span>
          </>
        ) : disabled ? (
          <span>OUT OF STOCK</span>
        ) : (
          <>
            <ShoppingCart
              className="w-5 h-5"
              style={{ filter: "drop-shadow(0 0 4px rgba(120,255,124,.5))" }}
            />
            <span>ADD TO CART</span>
          </>
        )}

        <style jsx>{`
          @keyframes crt-shimmer {
            100% {
              transform: translateX(200%);
            }
          }
          .animate-crt-shimmer {
            animation: crt-shimmer 2.5s infinite;
          }
        `}</style>
      </div>
    </button>
  );
}
