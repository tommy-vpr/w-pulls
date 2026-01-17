"use client";

import { useCartStore } from "@/lib/cart/cart.store";

export function CheckoutButton() {
  const items = useCartStore((s) => s.items);

  async function checkout() {
    const res = await fetch("/checkout/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button onClick={checkout} className="w-full bg-black text-white py-3">
      Checkout
    </button>
  );
}
