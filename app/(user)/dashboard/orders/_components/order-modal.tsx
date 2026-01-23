"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { cn } from "@/lib/utils";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";
import "./order-modal.css";
import type { SerializedOrder } from "@/lib/services/order.service";

interface OrderModalProps {
  order: SerializedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tier = getTierConfig(order?.selectedTier);
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
              className="cursor-pointer absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors z-20"
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
                  "--card-gradient":
                    "linear-gradient(135deg, #3f3f46 0%, #27272a 50%, #3f3f46 100%)",
                  "--glow-color": "rgba(63, 63, 70, 0.4)",
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
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center rounded-xl">
                    <Sparkles className="h-16 w-16 text-zinc-600" />
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
