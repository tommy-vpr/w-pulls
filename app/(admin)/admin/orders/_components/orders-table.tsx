"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SerializedOrder } from "@/lib/services/order.service";
import {
  updateOrderStatus,
  refundOrder,
  deleteOrder,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getTierBadgeClass, getTierConfig } from "@/lib/tier-config";

interface OrdersTableProps {
  orders: SerializedOrder[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

const statusConfig: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-900/30 text-amber-400 border-amber-700/50",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-900/30 text-red-400 border-red-700/50",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

export function OrdersTable({ orders, pagination }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusUpdate = async (orderId: string, status: any) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (result.success) {
        toast.success("Order status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleRefund = async () => {
    if (!selectedOrderId) return;

    startTransition(async () => {
      const result = await refundOrder(selectedOrderId);
      if (result.success) {
        toast.success("Order refunded successfully");
      } else {
        toast.error(result.error || "Failed to refund order");
      }
      setRefundDialogOpen(false);
      setSelectedOrderId(null);
    });
  };

  const handleDelete = async () => {
    if (!selectedOrderId) return;

    startTransition(async () => {
      const result = await deleteOrder(selectedOrderId);
      if (result.success) {
        toast.success("Order deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete order");
      }
      setDeleteDialogOpen(false);
      setSelectedOrderId(null);
    });
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Clock className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100">No orders found</h3>
        <p className="text-zinc-500 mt-1">
          Orders will appear here once customers start purchasing packs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Order</TableHead>
              <TableHead className="text-zinc-400">Customer</TableHead>
              <TableHead className="text-zinc-400">Product</TableHead>
              <TableHead className="text-zinc-400">Tier</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const product = order.items[0]?.product ?? null;

              return (
                <TableRow
                  key={order.id}
                  className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Order ID & Pack */}
                  <TableCell>
                    <div>
                      <p className="font-mono text-xs text-zinc-500">
                        {order.id.slice(0, 8)}...
                      </p>
                      <p className="font-medium text-zinc-100">
                        {order.packName}
                      </p>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-100">
                        {order.customerName || order.user?.name || "Guest"}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {order.customerEmail || order.user?.email || "—"}
                      </p>
                    </div>
                  </TableCell>

                  {/* Product */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product?.imageUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                          <span className="text-xs text-zinc-500">?</span>
                        </div>
                      )}
                      <span className="font-medium text-zinc-100 truncate max-w-[150px]">
                        {product?.title ?? (
                          <span className="text-zinc-500">Not assigned</span>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Tier */}
                  <TableCell>
                    {order.selectedTier ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                          getTierBadgeClass(order.selectedTier)
                        )}
                      >
                        {getTierConfig(order.selectedTier).label}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-medium text-zinc-100">
                      ${(order.amount / 100).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                        status.className
                      )}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-800"
                      >
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>

                        {order.status === "PENDING" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(order.id, "COMPLETED")
                              }
                              className="cursor-pointer text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(order.id, "FAILED")
                              }
                              className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Mark Failed
                            </DropdownMenuItem>
                          </>
                        )}

                        {order.status === "COMPLETED" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setRefundDialogOpen(true);
                            }}
                            className="cursor-pointer text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refund Order
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-zinc-800" />

                        <DropdownMenuItem
                          className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-950/50"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {orders.length} of {pagination.total} orders
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-zinc-500 px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Refund Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              Refund Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to refund this order? This will mark the
              order as refunded. You may need to process the actual refund in
              Stripe separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={isPending}
              className="bg-white text-zinc-900 hover:bg-zinc-200"
            >
              {isPending ? "Processing..." : "Refund Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              Delete Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
