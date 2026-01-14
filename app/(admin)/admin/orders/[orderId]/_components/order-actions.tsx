"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
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
import {
  updateOrderStatus,
  refundOrder,
  deleteOrder,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";

interface OrderActionsProps {
  order: {
    id: string;
    status: string;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status as any);
      if (result.success) {
        toast.success("Order status updated");
        router.refresh();
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
        router.refresh();
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
          <button className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-zinc-900 border-zinc-800"
        >
          {order.status === "PENDING" && (
            <>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("FAILED")}
                className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
            </>
          )}

          {order.status === "COMPLETED" && (
            <>
              <DropdownMenuItem
                onClick={() => setRefundDialogOpen(true)}
                className="text-zinc-300 focus:text-zinc-100 focus:bg-zinc-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refund Order
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
            </>
          )}

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-400 focus:text-red-400 focus:bg-red-950/50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
}
