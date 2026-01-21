"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/cart.store";

interface ProcessingPageProps {
  params: {
    orderId: string;
  };
}

export default function ProcessingPage({ params }: ProcessingPageProps) {
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    // ✅ Safe point: Stripe payment succeeded, user returned
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold">Processing your order</h1>
        <p>This may take a few seconds…</p>
      </div>
    </div>
  );
}
