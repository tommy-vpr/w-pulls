"use client";

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
  orders: Order[];
}

export function RecentOrdersGrid({ orders }: RecentOrdersGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
