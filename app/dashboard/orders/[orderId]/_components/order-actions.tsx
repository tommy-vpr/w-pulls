"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface OrderActionsProps {
  order: SerializedOrder;
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const handleStatusUpdate = async (status: any) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast.success("Order status updated");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleRefund = async () => {
    startTransition(async () => {
      const result = await refundOrder(order.id);
      if (result.success) {
        toast.success("Order refunded successfully");
      } else {
        toast.error(result.error || "Failed to refund order");
      }
      setRefundDialogOpen(false);
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteOrder(order.id);
      if (result.success) {
        toast.success("Order deleted successfully");
        router.push("/dashboard/orders");
      } else {
        toast.error(result.error || "Failed to delete order");
      }
      setDeleteDialogOpen(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            <MoreHorizontal className="mr-2 h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {order.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={() => handleStatusUpdate("COMPLETED")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate("FAILED")}>
                <XCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {order.status === "COMPLETED" && (
            <>
              <DropdownMenuItem onClick={() => setRefundDialogOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refund Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
