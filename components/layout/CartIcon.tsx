// components/cart/CartIcon.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart/cart.store";

export function CartIcon() {
  const { items } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
    >
      <ShoppingCart className="w-6 h-6 text-zinc-400" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-[#78ff7c] text-black rounded-full">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
