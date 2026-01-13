"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const tierConfig: Record<
  string,
  { color: string; bgColor: string; borderColor: string }
> = {
  COMMON: {
    color: "text-slate-600",
    bgColor: "bg-slate-300",
    borderColor: "border-slate-500/30",
  },
  UNCOMMON: {
    color: "text-green-600",
    bgColor: "bg-green-300",
    borderColor: "border-green-500/30",
  },
  RARE: {
    color: "text-blue-600",
    bgColor: "bg-blue-300",
    borderColor: "border-blue-500/30",
  },
  ULTRA_RARE: {
    color: "text-purple-600",
    bgColor: "bg-purple-300",
    borderColor: "border-purple-500/30",
  },
  SECRET_RARE: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-300",
    borderColor: "border-yellow-500/30",
  },
  BANGER: {
    color: "text-orange-600",
    bgColor: "bg-orange-300",
    borderColor: "border-orange-500/30",
  },
  GRAIL: {
    color: "text-pink-600",
    bgColor: "bg-gradient-to-r from-pink-500/10 to-yellow-500/10",
    borderColor: "border-pink-500/30",
  },
};

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  COMPLETED: { icon: CheckCircle, color: "text-green-400", label: "Revealed" },
  PENDING: { icon: Clock, color: "text-amber-400", label: "Pending" },
  FAILED: { icon: XCircle, color: "text-red-400", label: "Failed" },
  REFUNDED: { icon: RotateCcw, color: "text-blue-400", label: "Refunded" },
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
    console.log("Modal Opened");
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
          <p className="text-sm text-muted-foreground">
            Showing {orders.length} of {pagination.total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
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
  const tier = order.selectedTier
    ? tierConfig[order.selectedTier] || tierConfig.COMMON
    : tierConfig.COMMON;
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const isHighTier = order.selectedTier
    ? ["ULTRA_RARE", "SECRET_RARE", "BANGER", "GRAIL"].includes(
        order.selectedTier
      )
    : false;
  const isRevealed = order.status === "COMPLETED" && order.product;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden border transition-all hover:shadow-lg cursor-pointer hover:scale-[1.02]",
        tier.borderColor,
        isHighTier && "ring-1 ring-offset-2 ring-offset-background",
        isHighTier && order.selectedTier === "GRAIL" && "ring-pink-500/50",
        isHighTier && order.selectedTier === "BANGER" && "ring-orange-500/50",
        isHighTier &&
          order.selectedTier === "SECRET_RARE" &&
          "ring-yellow-500/50",
        isHighTier &&
          order.selectedTier === "ULTRA_RARE" &&
          "ring-purple-500/50"
      )}
    >
      {/* Product Image */}
      <div className={cn("relative aspect-square", tier.bgColor)}>
        {isRevealed && order.product?.imageUrl ? (
          <img
            src={order.product.imageUrl}
            alt={order.product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Sparkles className={cn("h-12 w-12", tier.color, "opacity-50")} />
          </div>
        )}

        {/* Tier Badge */}
        {order.selectedTier && (
          <Badge
            className={cn(
              "absolute top-2 left-2 border-0",
              tier.bgColor,
              tier.color
            )}
          >
            {order.selectedTier.replace("_", " ")}
          </Badge>
        )}

        {/* Status Badge */}
        <div
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            "bg-background/80 backdrop-blur-sm",
            status.color
          )}
        >
          {status.label}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{order.packName}</p>
          <h3 className="font-semibold truncate">
            {isRevealed ? order.product!.title : "Mystery Card"}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="font-bold text-primary">
              {isRevealed
                ? `$${Number(order.product!.price).toFixed(2)}`
                : "???"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="font-medium">${(order.amount / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </p>
          <span className="text-xs text-muted-foreground">Click to view</span>
        </div>
      </CardContent>
    </Card>
  );
}
