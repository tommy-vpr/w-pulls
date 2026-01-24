// app/(public)/packs/reveal/[orderId]/RevealClient.tsx
"use client";

import { useEffect, useState } from "react";
import { PackSlashAnimation } from "@/components/reveal/PackSlashAnimation";

export default function RevealClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        console.error("Order status fetch failed", res.status);
        return;
      }

      const data = await res.json();
      setOrder(data);
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId]);

  if (!order || order.status === "PENDING" || order.status === "PROCESSING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        <p className="text-muted-foreground">Opening your pack…</p>
      </div>
    );
  }

  if (order.status === "FAILED") {
    window.location.href = "/packs?error=assignment_failed";
    return null;
  }

  return (
    <PackSlashAnimation
      product={order.product}
      tier={order.selectedTier}
      packName={order.packName}
      orderId={order.id}
      packTopImage="/images/pack-top.png"
      packBottomImage="/images/pack-bottom.png"
    />
  );
}
