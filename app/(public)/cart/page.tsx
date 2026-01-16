"use client";

import { useCartStore } from "@/lib/cart/cart.store";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const router = useRouter();

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

  if (items.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div>
      <h1>Your Cart</h1>

      {items.map((item) => (
        <div key={item.productId}>
          {item.productId} × {item.quantity}
        </div>
      ))}

      <button onClick={checkout}>Checkout</button>
    </div>
  );
}
