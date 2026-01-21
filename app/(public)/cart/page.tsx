"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader,
  ShoppingCart,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/cart.store";
import { useEffect, useState } from "react";
import { CheckoutButton } from "./(components)/CheckoutButton";

type CartProduct = {
  id: string;
  title: string;
  price: string;
  imageUrl?: string | null;
};

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => unsub();
  }, []);

  // Fetch product data after hydration
  useEffect(() => {
    if (!hydrated) return;

    async function loadProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const res = await fetch("/api/cart/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: items.map((i) => i.productId),
        }),
      });

      const data = await res.json();
      setProducts(data.products);
      setLoading(false);
    }

    loadProducts();
  }, [items, hydrated]);

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400 flex items-center gap-2">
          <Loader className="h-6 w-6 animate-spin" />
          Loading cart…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-full bg-slate-600/20 p-8 flex items-center justify-center mb-6">
          <ShoppingCart
            className="w-16 h-16 text-cyan-400"
            style={{ filter: "drop-shadow(0 0 8px rgba(0,255,255,.5))" }}
          />
        </div>
        {/* <Image
          src={"/images/empty-bag.webp"}
          width="240"
          height="280"
          alt="continue shopping"
          className="opacity-70"
        /> */}
        <h1 className="text-xl md:text-2xl font-semibold mb-2 text-gray-300">
          Your cart is empty
        </h1>
        <p className="text-center text-gray-600">
          Looks like you haven't added <br />
          anything to your cart yet{" "}
        </p>

        <Link
          href="/store"
          className="group relative text-sm px-6 py-3 font-mono font-semibold uppercase mt-12
          tracking-wider rounded overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
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
          {/* Hover glow */}
          <span
            className="pointer-events-none absolute inset-[-4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,255,255,.5), transparent 60%)",
              filter: "blur(12px)",
            }}
          />
          Continue Shopping
        </Link>
      </div>
    );
  }

  const merged = products.reduce<(CartProduct & { quantity: number })[]>(
    (acc, p) => {
      const item = items.find((i) => i.productId === p.id);
      if (item) {
        acc.push({ ...p, quantity: item.quantity });
      }
      return acc;
    },
    []
  );

  const subtotal = merged.reduce(
    (sum, p) => sum + Number(p.price) * p.quantity,
    0
  );

  const itemCount = merged.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 font-mono">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-200">Shopping Cart</h1>
        <p className="text-zinc-400 mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-7 xl:col-span-8 text-gray-200">
          <div className="space-y-4">
            {merged.map((p) => (
              <div
                key={p.id}
                className="group bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 transition-colors hover:border-slate-700"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Product Image */}
                  <div className="relative w-28 aspect-square flex-shrink-0 rounded-lg bg-slate-800">
                    {p.imageUrl ? (
                      <div className="absolute inset-2">
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 96px, 128px"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1">
                        {p.title}
                      </h3>
                      <p
                        className="text-sm font-mono"
                        style={{ textShadow: "0 0 6px rgba(120,255,124,.4)" }}
                      >
                        ${p.price}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(p.id, Math.max(1, p.quantity - 1))
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          disabled={p.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-mono">
                          {p.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p.id, p.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(p.id)}
                        className="cursor-pointer flex items-center gap-2 text-red-400  transition-colors text-sm
                            rounded-sm px-3 py-2 bg-red-800/20 hover:text-red-800 hover:bg-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        {/* <span className="hidden sm:inline">Remove</span> */}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping Link */}
          <Link
            href="/store"
            className="inline-flex items-center gap-2 mt-6 text-zinc-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0 text-gray-200">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-white">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 my-4" />

            <div className="flex justify-between text-lg font-semibold mb-6">
              <span>Total</span>
              <span
                className="text-[#78ff7c]"
                style={{ textShadow: "0 0 6px rgba(120,255,124,.4)" }}
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <CheckoutButton />

            <p className="text-xs text-zinc-500 text-center mt-4">
              Taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
