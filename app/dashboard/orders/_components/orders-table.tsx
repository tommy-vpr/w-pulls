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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
};

// const tierConfig: Record<string, string> = {
//   COMMON: "bg-slate-500/10 text-slate-400",
//   UNCOMMON: "bg-green-500/10 text-green-400",
//   RARE: "bg-blue-500/10 text-blue-400",
//   ULTRA_RARE: "bg-purple-500/10 text-purple-400",
//   SECRET_RARE: "bg-yellow-500/10 text-yellow-400",
//   BANGER: "bg-orange-500/10 text-orange-400",
//   GRAIL: "bg-pink-500/10 text-pink-400",
// };

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="text-muted-foreground mt-1">
          Orders will appear here once customers start purchasing packs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <TableRow key={order.id}>
                  {/* Order ID & Pack */}
                  <TableCell>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {order.id.slice(0, 8)}...
                      </p>
                      <p className="font-medium">{order.packName}</p>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.customerName || order.user?.name || "Guest"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerEmail || order.user?.email || "—"}
                      </p>
                    </div>
                  </TableCell>

                  {/* Product */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {order.product?.imageUrl ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={order.product.imageUrl}
                            alt={order.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            ?
                          </span>
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[150px]">
                        {order.product?.title ?? (
                          <span className="text-muted-foreground">
                            Not assigned
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Tier */}
                  <TableCell>
                    {order.selectedTier ? (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-600 font-normal text-xs"
                      >
                        {order.selectedTier.replace("_", " ")}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-medium">
                      ${(order.amount / 100).toFixed(2)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
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
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(order.id, "FAILED")
                              }
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
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refund Order
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
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
        <p className="text-sm text-muted-foreground">
          Showing {orders.length} of {pagination.total} orders
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Refund Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this order? This will mark the
              order as refunded. You may need to process the actual refund in
              Stripe separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} disabled={isPending}>
              {isPending ? "Processing..." : "Refund Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isPending ? "Deleting..." : "Delete Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
