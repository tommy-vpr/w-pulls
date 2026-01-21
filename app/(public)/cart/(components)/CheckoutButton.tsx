"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart/cart.store";
import { Loader2 } from "lucide-react";

export function CheckoutButton() {
  const items = useCartStore((s) => s.items);
  const [isLoading, setIsLoading] = useState(false);

  async function checkout() {
    if (isLoading || items.length === 0) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/checkout/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Handle error - maybe show a toast
        console.error("Checkout failed:", data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={checkout}
      disabled={isLoading || items.length === 0}
      className="font-mono uppercase w-full border border-green-300/30 bg-green-600/30 rounded text-green-400 
        hover:text-white hover:bg-green-500 transition duration-300 py-3 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600/30 disabled:hover:text-green-400
        flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Checkout"
      )}
    </button>
  );
}
