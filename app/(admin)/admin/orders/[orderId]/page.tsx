import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { getOrderById } from "@/lib/actions/order.actions";
import { OrderActions } from "./_components/order-actions";
import { cn } from "@/lib/utils";
import { getTierBadgeClass, getTierConfig } from "@/lib/tier-config";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId.slice(0, 8)} | Dashboard`,
  };
}

const statusConfig: Record<
  string,
  { label: string; icon: any; className: string; timelineClassName: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    timelineClassName: "bg-amber-900/30 text-amber-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    timelineClassName: "bg-emerald-900/30 text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-900/30 text-red-400 border-red-700/50",
    timelineClassName: "bg-red-900/30 text-red-400",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    timelineClassName: "bg-zinc-800 text-zinc-400",
  },
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const result = await getOrderById(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const item = order.items[0];
  const product = item?.product ?? null;
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const tier = order.selectedTier ? getTierConfig(order.selectedTier) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-100">
                <span className="font-normal text-gray-500">Order:</span> #
                {order.orderNumber.toString()}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border",
                  status.className,
                )}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </span>
            </div>
            <p className="text-zinc-500 font-mono text-sm">ID: {order.id}</p>
          </div>
        </div>
        <OrderActions order={order} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Product Details
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                {product?.imageUrl ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700 shrink-0">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-zinc-100">
                        {product?.title || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        From: {order.packName}
                      </p>
                    </div>
                    {product && (
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Product
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {order.selectedTier && tier && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border",
                          getTierBadgeClass(order.selectedTier),
                        )}
                      >
                        {tier.label}
                      </span>
                    )}

                    <span className="text-2xl font-bold text-zinc-100">
                      ${Number(product?.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Customer Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500">Name</p>
                  <p className="font-medium text-zinc-100">
                    {order.customerName || order.user?.name || "Guest"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="font-medium text-zinc-100">
                    {order.customerEmail || order.user?.email || "—"}
                  </p>
                </div>
              </div>
              {order.user && (
                <>
                  <div className="border-t border-zinc-800" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Registered User</p>
                      <p className="font-mono text-sm text-zinc-400">
                        {order.user.id}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/users/${order.user.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Payment Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500">Amount Paid</p>
                  <p className="text-2xl font-bold text-zinc-100">
                    ${(order.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Payment Status</p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border mt-1",
                      status.className,
                    )}
                  >
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </span>
                </div>
              </div>
              {order.stripeSessionId && (
                <>
                  <div className="border-t border-zinc-800" />
                  <div>
                    <p className="text-sm text-zinc-500">Stripe Session ID</p>
                    <p className="font-mono text-sm text-zinc-400 break-all">
                      {order.stripeSessionId}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-violet-900/30 flex items-center justify-center">
                      <Package className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="w-px h-full bg-zinc-800" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-zinc-100">Order Created</p>
                    <p className="text-sm text-zinc-500">
                      {format(
                        new Date(order.createdAt),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </p>
                  </div>
                </div>

                {order.status === "COMPLETED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Payment Completed
                      </p>
                      <p className="text-sm text-zinc-500">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "FAILED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-red-900/30 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Payment Failed
                      </p>
                      <p className="text-sm text-zinc-500">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "REFUNDED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Order Refunded
                      </p>
                      <p className="text-sm text-zinc-500">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "PENDING" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-amber-900/30 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Awaiting Payment
                      </p>
                      <p className="text-sm text-zinc-500">
                        Waiting for confirmation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Quick Info
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Pack ID</span>
                <span className="font-mono text-sm text-zinc-400">
                  {order.packId ? `${order.packId.slice(0, 8)}...` : "—"}
                </span>
              </div>
              <div className="border-t border-zinc-800" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Product ID</span>
                <span className="font-mono text-sm text-zinc-400">
                  {product?.id ? `${product.id.slice(0, 8)}...` : "—"}
                </span>
              </div>
              <div className="border-t border-zinc-800" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Created</span>
                <span className="text-sm text-zinc-300">
                  {format(new Date(order.createdAt), "PP")}
                </span>
              </div>
              <div className="border-t border-zinc-800" />
              <div className="flex justify-between">
                <span className="text-zinc-500">Updated</span>
                <span className="text-sm text-zinc-300">
                  {format(new Date(order.updatedAt), "PP")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
