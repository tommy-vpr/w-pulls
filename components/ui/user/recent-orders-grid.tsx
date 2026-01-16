"use client";

import { SerializedOrder } from "@/lib/services/order.service";
import { OrderCard } from "./order-card-tilt";

interface Order {
  id: string;
  packName: string;
  amount: number;
  selectedTier: string | null;
  status: string;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    price: any;
    tier: string;
  } | null;
}

interface RecentOrdersGridProps {
  orders: SerializedOrder[];
}

export function RecentOrdersGrid({ orders }: RecentOrdersGridProps) {
  console.log(orders);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
