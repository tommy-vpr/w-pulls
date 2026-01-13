"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SerializedProduct } from "@/types/product";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OrderModal } from "./order-modal";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";

interface Order {
  id: string;
  packId: string;
  packName: string;
  amount: number;
  selectedTier: string | null;
  status: string;
  createdAt: string;
  product: SerializedProduct | null;
}

interface OrdersGridProps {
  orders: Order[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  COMPLETED: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-900/40",
    label: "Revealed",
  },
  PENDING: {
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-900/40",
    label: "Pending",
  },
  FAILED: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-900/40",
    label: "Failed",
  },
  REFUNDED: {
    icon: RotateCcw,
    color: "text-blue-400",
    bgColor: "bg-blue-900/40",
    label: "Refunded",
  },
};

export function OrdersGrid({ orders, pagination }: OrdersGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleCardClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onClick={() => handleCardClick(order)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {orders.length} of {pagination.total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="h-9 w-9 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-zinc-400 px-3 min-w-[80px] text-center">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="h-9 w-9 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const tier = getTierConfig(order.selectedTier);
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const isRevealed = order.status === "COMPLETED" && order.product;

  return (
    <div
      onClick={onClick}
      className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-zinc-800">
        {isRevealed && order.product?.imageUrl ? (
          <img
            src={order.product.imageUrl}
            alt={order.product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-zinc-600 opacity-40" />
          </div>
        )}

        {/* Tier Badge */}
        {order.selectedTier && (
          <span
            className={cn(
              "absolute top-3 left-3 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border backdrop-blur-sm",
              getTierBadgeClass(order.selectedTier)
            )}
          >
            {tier.label}
          </span>
        )}

        {/* Status Badge */}
        <div
          className={cn(
            "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
            status.bgColor,
            status.color,
            "border border-current/20 backdrop-blur-sm"
          )}
        >
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-zinc-500">{order.packName}</p>
          <h3 className="font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
            {isRevealed ? order.product!.title : "Mystery Card"}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Value</p>
            <p
              className={cn(
                "font-bold",
                isRevealed ? "text-emerald-400" : "text-zinc-500"
              )}
            >
              {isRevealed
                ? `$${Number(order.product!.price).toFixed(2)}`
                : "???"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Paid</p>
            <p className="font-medium text-zinc-300">
              ${(order.amount / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </p>
          <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
            Click to view
          </span>
        </div>
      </div>
    </div>
  );
}
