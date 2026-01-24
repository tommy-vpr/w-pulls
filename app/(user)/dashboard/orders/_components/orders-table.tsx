// components/orders/orders-table.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
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
  LucideIcon,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SerializedProduct } from "@/types/product";
import { cn } from "@/lib/utils";
import { getTierConfig, getTierBadgeClass } from "@/lib/tier-config";
import { OrderModal } from "./order-modal";
// import { OrderStatus } from "@/types/order";
import { OrderStatus } from "@prisma/client";

// import type { SerializedUserOrder } from "@/lib/actions/user-orders.actions";
import type { SerializedOrder } from "@/lib/services/order.service"; // Updated import

interface OrdersTableProps {
  orders: SerializedOrder[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const statusConfig: Record<
  OrderStatus,
  {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    label: string;
  }
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
  PROCESSING: {
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-900/40",
    label: "Processing",
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
  ABANDONED: {
    icon: XCircle,
    color: "text-zinc-400",
    bgColor: "bg-zinc-800/40",
    label: "Abandoned",
  },
};

export function OrdersTable({ orders, pagination }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<SerializedOrder | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleQuickView = (order: SerializedOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Sparkles className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100">No orders yet</h3>
        <p className="text-zinc-500 mt-1">
          Your orders will appear here after you open some packs.
        </p>
        <Link
          href="/packs"
          className="mt-4 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Open Packs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Card</TableHead>
              <TableHead className="text-zinc-400">Pack</TableHead>
              <TableHead className="text-zinc-400">Tier</TableHead>
              <TableHead className="text-zinc-400">Value</TableHead>
              <TableHead className="text-zinc-400">Paid</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const tier = getTierConfig(order.selectedTier);
              const status =
                statusConfig[order.status as OrderStatus] ||
                statusConfig.PENDING;
              const StatusIcon = status.icon;
              const isRevealed = order.status === "COMPLETED" && order.product;

              return (
                <TableRow
                  key={order.id}
                  className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Card/Product */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {isRevealed && order.product?.imageUrl ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                          <Image
                            src={order.product.imageUrl}
                            alt={order.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-100 truncate max-w-[180px]">
                          {isRevealed ? order.product!.title : "Mystery Card"}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Pack */}
                  <TableCell>
                    <span className="text-zinc-300">{order.packName}</span>
                  </TableCell>

                  {/* Tier */}
                  <TableCell>
                    {order.selectedTier ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                          getTierBadgeClass(order.selectedTier),
                        )}
                      >
                        {tier.label}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Value */}
                  <TableCell>
                    <span
                      className={cn(
                        "font-semibold",
                        isRevealed ? "text-emerald-400" : "text-zinc-500",
                      )}
                    >
                      {isRevealed
                        ? `$${Number(order.product!.price).toFixed(2)}`
                        : "???"}
                    </span>
                  </TableCell>

                  {/* Paid */}
                  <TableCell>
                    <span className="font-medium text-zinc-300">
                      ${(order.amount / 100).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium border border-current/20",
                        status.bgColor,
                        status.color,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Link>
                      {isRevealed && (
                        <button
                          onClick={() => handleQuickView(order)}
                          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-200 hover:text-gray-300 hover:bg-gray-900/30 transition-colors"
                        >
                          View Card
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-zinc-500 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
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
