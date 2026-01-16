import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Truck,
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import { cn } from "@/lib/utils";
import { getTierBadgeClass, getTierConfig } from "@/lib/tier-config";
import { CopyButton } from "@/components/ui/copy-button";

interface UserOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: UserOrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId.slice(0, 8)} | My Orders`,
  };
}

const statusConfig: Record<
  string,
  { label: string; icon: any; className: string; description: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    description: "Your order is being processed",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
    description: "Your order has been completed",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-900/30 text-red-400 border-red-700/50",
    description: "Payment failed - please try again",
  },
  REFUNDED: {
    label: "Refunded",
    icon: RotateCcw,
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    description: "This order has been refunded",
  },
};

export default async function UserOrderDetailPage({
  params,
}: UserOrderDetailPageProps) {
  const session = await auth();
  const { orderId } = await params;
  const result = await getOrderById(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  const item = order.items[0] ?? null;

  if (!item) {
    notFound();
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const tier = getTierConfig(order.selectedTier);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Orders
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-zinc-100">
                  Order Details
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border",
                    status.className
                  )}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-zinc-500 font-mono text-sm">{order.id}</p>
                <CopyButton text={order.id} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500">Order Date</p>
              <p className="text-zinc-100 font-medium">
                {format(new Date(order.createdAt), "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-zinc-500">
                {format(new Date(order.createdAt), "h:mm a")}
              </p>
            </div>
          </div>

          {/* Status Description */}
          <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
            <p className="text-sm text-zinc-300">{status.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Your Pull</h2>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="relative shrink-0">
                  {item.product.imageUrl ? (
                    <div className="relative h-40 w-32 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: `linear-gradient(135deg, ${tier.hexColor}40 0%, transparent 50%)`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-32 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Package className="h-10 w-10 text-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-100">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      From:{" "}
                      <span className="text-zinc-400">{order.packName}</span>
                    </p>
                  </div>

                  {/* Tier Badge */}
                  {order.selectedTier && (
                    <div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium border",
                          getTierBadgeClass(order.selectedTier)
                        )}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        {tier.label}
                      </span>
                    </div>
                  )}

                  {/* Product Value */}
                  <div className="pt-2">
                    <p className="text-sm text-zinc-500">Card Value</p>
                    <p className="text-2xl font-bold text-zinc-100">
                      ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Description if available */}
              {item.product.description && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    {item.product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Order Created */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-violet-900/30 flex items-center justify-center border border-violet-700/50">
                      <Package className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="w-px flex-1 bg-zinc-800 mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-zinc-100">Pack Opened</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {format(
                        new Date(order.createdAt),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                    <p className="text-sm text-zinc-400 mt-2">
                      You pulled a {tier.label} card from {order.packName}
                    </p>
                  </div>
                </div>

                {/* Payment Status */}
                {order.status === "COMPLETED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-700/50">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="w-px flex-1 bg-zinc-800 mt-2" />
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-zinc-100">
                        Payment Confirmed
                      </p>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {format(
                          new Date(order.updatedAt),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                      <p className="text-sm text-zinc-400 mt-2">
                        Payment of ${(order.amount / 100).toFixed(2)} was
                        successful
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "FAILED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-red-900/30 flex items-center justify-center border border-red-700/50">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Payment Failed
                      </p>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {format(
                          new Date(order.updatedAt),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                      <p className="text-sm text-red-400 mt-2">
                        Your payment could not be processed
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "REFUNDED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                        <RotateCcw className="h-5 w-5 text-zinc-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Order Refunded
                      </p>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {format(
                          new Date(order.updatedAt),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                      <p className="text-sm text-zinc-400 mt-2">
                        ${(order.amount / 100).toFixed(2)} has been refunded
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "PENDING" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-700/50 animate-pulse">
                        <Clock className="h-5 w-5 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        Awaiting Payment
                      </p>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        Processing...
                      </p>
                      <p className="text-sm text-amber-400 mt-2">
                        Your payment is being confirmed
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipping - Placeholder for future */}
                {order.status === "COMPLETED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 border-dashed">
                        <Truck className="h-5 w-5 text-zinc-500" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-400">Shipping</p>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        Coming soon
                      </p>
                      <p className="text-sm text-zinc-500 mt-2">
                        Shipping details will appear here once available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Payment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Pack Price</span>
                <span className="text-zinc-100 font-medium">
                  ${(order.amount / 100).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-zinc-800" />
              <div className="flex justify-between">
                <span className="text-zinc-100 font-medium">Total Paid</span>
                <span className="text-xl font-bold text-zinc-100">
                  ${(order.amount / 100).toFixed(2)}
                </span>
              </div>

              {/* Payment Method Placeholder */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                  Payment Method
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-12 rounded bg-zinc-800 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-zinc-500" />
                  </div>
                  <span className="text-sm text-zinc-400">
                    •••• •••• •••• ****
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address - Placeholder */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Shipping</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-4">
                <Truck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">
                  Shipping information will be added soon
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  You'll receive tracking details via email
                </p>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="p-6 text-center">
              <p className="text-sm text-zinc-400 mb-3">
                Need help with this order?
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Contact Support
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
