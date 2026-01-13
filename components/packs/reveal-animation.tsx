"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SerializedProduct } from "@/types/product";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RevealAnimationProps {
  product: SerializedProduct;
  tier: string;
  packName: string;
}

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
  const [stage, setStage] = useState<"mystery" | "revealing" | "revealed">(
    "mystery"
  );
  const [showParticles, setShowParticles] = useState(false);

  const tierStyle = tierConfig[tier] || tierConfig.COMMON;
  const isHighTier = ["ULTRA_RARE", "SECRET_RARE", "BANGER", "GRAIL"].includes(
    tier
  );

  const handleReveal = () => {
    setStage("revealing");
    setShowParticles(true);

    setTimeout(() => {
      setStage("revealed");
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Particles */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  tierStyle.bgColor
                )}
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Mystery Stage */}
        {stage === "mystery" && (
          <motion.div
            key="mystery"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, rotateY: 90 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative mx-auto w-64 h-80 mb-8">
              {/* Mystery Card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-20 w-20 text-white/80" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Glow Effect */}
              <motion.div
                className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <p className="text-lg text-gray-500 mb-2">{packName}</p>
            <p className="text-2xl font-bold mb-6 text-gray-300">
              Your mystery card awaits...
            </p>

            <button
              onClick={handleReveal}
              className="cursor-pointer group relative overflow-hidden rounded-xl bg-accent-foreground px-10 py-5 text-lg font-bold uppercase tracking-widest text-violet-400 transition-all duration-300 hover:-translate-y-1 border-2 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5),0_0_40px_rgba(139,92,246,0.2)]"
            >
              {/* Shine sweep */}
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

              {/* Glow pulse */}
              <span className="absolute -inset-1 -z-10 animate-pulse rounded-xl bg-violet-500 opacity-50 blur-xl" />

              <span className="relative flex items-center gap-3">
                <Sparkles className="h-6 w-6 animate-pulse" />
                Reveal Card
              </span>
            </button>
          </motion.div>
        )}

        {/* Revealing Stage */}
        {stage === "revealing" && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="relative mx-auto w-64 h-80 mb-8">
              <motion.div
                className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br rounded-2xl flex items-center justify-center",
                    isHighTier
                      ? "from-yellow-400 via-orange-500 to-red-600"
                      : "from-primary/80 to-primary"
                  )}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="h-16 w-16 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Epic Glow for High Tier */}
              {isHighTier && (
                <motion.div
                  className="absolute -inset-8 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 rounded-3xl blur-2xl -z-10"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>

            <motion.p
              className="text-2xl font-bold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              Revealing...
            </motion.p>
          </motion.div>
        )}

        {/* Revealed Stage */}
        {stage === "revealed" && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-center"
          >
            {/* Tier Banner */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <Badge
                className={cn(
                  "text-lg px-4 py-1",
                  tierStyle.bgColor,
                  "text-white border-0"
                )}
              >
                {tierStyle.label}
              </Badge>
            </motion.div>

            {/* Product Card */}
            <motion.div
              className="relative mx-auto max-w-sm mb-6"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className={cn(
                  "rounded-2xl shadow-2xl overflow-hidden border-4",
                  isHighTier ? "border-yellow-400" : "border-primary/20"
                )}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Epic Glow for High Tier */}
              {isHighTier && (
                <motion.div
                  className={cn(
                    "absolute -inset-4 rounded-3xl blur-xl -z-10",
                    tierStyle.bgColor,
                    "opacity-30"
                  )}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
