// components/checkout/OrderSuccessContent.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Package,
  Mail,
  MapPin,
  ArrowRight,
  Download,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCartStore } from "@/lib/cart/cart.store";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
}

interface OrderSuccessContentProps {
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerEmail: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export function OrderSuccessContent({
  orderNumber,
  orderDate,
  items,
  subtotal,
  tax,
  shipping,
  total,
  customerEmail,
  shippingAddress,
}: OrderSuccessContentProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const clearCart = useCartStore((state) => state.clear); // Add this

  useEffect(() => {
    // Clear cart on successful order
    clearCart();

    // Trigger confetti on mount
    setShowConfetti(true);

    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#00ffff", "#ff00ff", "#ffffff"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [clearCart]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,20,28,.95), rgba(6,12,18,.95))",
              border: "2px solid rgba(0,255,255,.5)",
              boxShadow:
                "0 0 40px rgba(0,255,255,.3), inset 0 0 30px rgba(0,255,255,.1)",
            }}
          >
            <CheckCircle
              className="w-12 h-12 text-cyan-400"
              style={{ filter: "drop-shadow(0 0 10px rgba(0,255,255,.6))" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs uppercase tracking-widest text-cyan-400">
                Order Confirmed
              </span>
            </div>

            <h1
              className="font-orbitron text-3xl md:text-4xl font-bold text-cyan-400 mb-3"
              style={{
                textShadow: `
                  0 0 10px rgba(0, 255, 255, 0.7),
                  0 0 20px rgba(0, 255, 255, 0.5),
                  0 0 40px rgba(0, 255, 255, 0.3)
                `,
              }}
            >
              THANK YOU!
            </h1>

            <p className="text-cyan-100/60 max-w-md mx-auto">
              Your order has been placed successfully. We&apos;ve sent a
              confirmation email to{" "}
              <span className="text-cyan-400">{customerEmail}</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8"
        >
          {/* Glow effect */}
          <div
            className="absolute -inset-[1px] rounded-xl opacity-50 blur-sm pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.2))",
            }}
          />

          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,20,28,.95), rgba(6,12,18,.95))",
              border: "1px solid rgba(0,255,255,.3)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="font-orbitron text-sm text-white uppercase tracking-wider">
                    Order #{orderNumber}
                  </h2>
                  <p className="text-[10px] text-cyan-400/50">{orderDate}</p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border"
                style={{
                  background: "rgba(0,255,255,.1)",
                  borderColor: "rgba(0,255,255,.4)",
                  color: "#00ffff",
                }}
              >
                Confirmed
              </span>
            </div>

            {/* Items */}
            <div className="p-6">
              <h3 className="text-[10px] uppercase tracking-widest text-cyan-400/50 mb-4">
                Items
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        background: "rgba(0,255,255,.05)",
                        border: "1px solid rgba(0,255,255,.2)",
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-cyan-400/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-cyan-400/50">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-mono text-cyan-400">
                      ${(item.price / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

              {/* Totals */}
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-100/50">Subtotal</span>
                  <span className="text-cyan-100">
                    ${(subtotal / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-100/50">Tax</span>
                  <span className="text-cyan-100">
                    ${(tax / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-100/50">Shipping</span>
                  <span className="text-cyan-100">
                    {shipping === 0
                      ? "FREE"
                      : `$${(shipping / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-cyan-400/20 flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span
                    className="font-bold text-lg text-cyan-400"
                    style={{ textShadow: "0 0 8px rgba(0,255,255,.4)" }}
                  >
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="px-6 pb-6">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: "rgba(0,255,255,.03)",
                    border: "1px solid rgba(0,255,255,.15)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-cyan-400/60" />
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400/50">
                      Shipping To
                    </span>
                  </div>
                  <p className="text-sm text-cyan-100/80 leading-relaxed">
                    {shippingAddress.line1}
                    {shippingAddress.line2 && (
                      <>
                        <br />
                        {shippingAddress.line2}
                      </>
                    )}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.postalCode}
                    <br />
                    {shippingAddress.country}
                  </p>
                </div>
              </div>
            )}

            {/* Email Notice */}
            <div className="px-6 pb-6">
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: "rgba(0,255,255,.03)",
                  border: "1px solid rgba(0,255,255,.15)",
                }}
              >
                <Mail className="w-5 h-5 text-cyan-400/60" />
                <p className="text-xs text-cyan-100/60">
                  A confirmation email has been sent to{" "}
                  <span className="text-cyan-400">{customerEmail}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Link
            href="/dashboard/orders"
            className="group relative flex items-center justify-center gap-2 py-4 px-6 font-mono font-semibold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(180deg, rgba(12,20,28,.95), rgba(6,12,18,.95))",
              border: "1px solid rgba(0,255,255,.45)",
              color: "#00ffff",
              boxShadow:
                "inset 0 0 12px rgba(0,255,255,.15), 0 4px 12px rgba(0,0,0,.3)",
              textShadow: "0 0 6px rgba(0,255,255,.4)",
            }}
          >
            <span
              className="pointer-events-none absolute inset-[-4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(0,255,255,.5), transparent 60%)",
                filter: "blur(12px)",
              }}
            />
            <Download className="w-4 h-4" />
            View Orders
          </Link>

          <Link
            href="/store"
            className="group relative flex items-center justify-center gap-2 py-4 px-6 font-mono font-semibold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
              border: "none",
              color: "#ffffff",
              boxShadow:
                "0 0 20px rgba(0,255,255,.3), 0 4px 12px rgba(0,0,0,.3)",
            }}
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-cyan-100/40 mt-8"
        >
          Need help?{" "}
          <Link href="/support" className="text-cyan-400 hover:underline">
            Contact Support
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
