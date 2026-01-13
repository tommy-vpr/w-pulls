"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { cn } from "@/lib/utils";
import "./order-modal.css";

interface Order {
  id: string;
  packId: string;
  packName: string;
  amount: number;
  selectedTier: string | null;
  status: string;
  createdAt: string;
  product: SerializedProduct | null;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const tierConfig: Record<string, { gradient: string; glowColor: string }> = {
  COMMON: {
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 50%, #64748b 100%)",
    glowColor: "rgba(100, 116, 139, 0.4)",
  },
  UNCOMMON: {
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
    glowColor: "rgba(34, 197, 94, 0.4)",
  },
  RARE: {
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #3b82f6 100%)",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  ULTRA_RARE: {
    gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #a855f7 100%)",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  SECRET_RARE: {
    gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #eab308 100%)",
    glowColor: "rgba(234, 179, 8, 0.4)",
  },
  BANGER: {
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #f97316 100%)",
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  GRAIL: {
    gradient:
      "linear-gradient(135deg, #ec4899 0%, #db2777 30%, #f59e0b 70%, #fbbf24 100%)",
    glowColor: "rgba(236, 72, 153, 0.5)",
  },
};

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tier = order?.selectedTier || "COMMON";
  const style = tierConfig[tier] || tierConfig.COMMON;
  const isRevealed = order?.status === "COMPLETED" && order?.product;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 15;
    const tiltY = (centerX - x) / 15;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors z-20"
            >
              <X className="h-6 w-6" />
            </button>

            {/* 3D Tilt Card */}
            <div
              ref={cardRef}
              className={cn("order-modal-card", isHovering && "is-hovering")}
              style={
                {
                  "--tilt-x": `${tilt.x}deg`,
                  "--tilt-y": `${tilt.y}deg`,
                  "--card-gradient": style.gradient,
                  "--glow-color": style.glowColor,
                } as React.CSSProperties
              }
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Holographic Overlay */}
              <div className="order-modal-holo" />

              {/* Glitter Effect */}
              <div className="order-modal-glitter" />

              {/* Shine Effect */}
              <div className="order-modal-shine" />

              {/* Card Image */}
              <div className="order-modal-content">
                {isRevealed && order.product?.imageUrl ? (
                  <img
                    src={order.product.imageUrl}
                    alt={order.product.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-xl">
                    <Sparkles className="h-16 w-16 text-white/40" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
