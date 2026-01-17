"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  quantity: number;
};

interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === productId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { productId, quantity }],
          });
        }
      },

      removeItem: (productId) =>
        set({
          items: get().items.filter((i) => i.productId !== productId),
        }),

      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: "store-cart", // localStorage key
    }
  )
);
