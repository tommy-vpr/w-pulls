"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Eye,
  Expand,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { OrderModal } from "./order-modal";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";
import { SerializedUserOrder } from "@/lib/actions/user-orders.actions";

interface OrdersGridProps {
  orders: SerializedUserOrder[];
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
  const [selectedOrder, setSelectedOrder] =
    useState<SerializedUserOrder | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleQuickView = (order: SerializedUserOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onQuickView={() => handleQuickView(order)}
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
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-zinc-400 px-3 min-w-[80px] text-center">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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

function OrderCard({
  order,
  onQuickView,
}: {
  order: SerializedUserOrder;
  onQuickView: () => void;
}) {
  const tier = getTierConfig(order.selectedTier);
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const isRevealed = order.status === "COMPLETED" && order.product;

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-black/20">
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

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Details
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 text-sm font-medium border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            <Expand className="h-4 w-4" />
            View Card
          </button>
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
          {/* Action Links - Always visible */}
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="cursor-pointer text-xs text-zinc-500 hover:text-violet-400 transition-colors"
            >
              Details
            </Link>
            <span className="text-zinc-700">•</span>
            <button
              onClick={onQuickView}
              className="cursor-pointer text-xs text-zinc-500 hover:text-violet-400 transition-colors"
            >
              View Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
