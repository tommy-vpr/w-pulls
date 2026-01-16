"use client";

import { useCartStore } from "@/lib/cart/cart.store";

export function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button onClick={() => addItem(productId, 1)} className="btn-primary">
      Add to Cart
    </button>
  );
}
