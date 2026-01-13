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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "./_components/order-actions";
import { cn } from "@/lib/utils";

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

const tierConfig: Record<string, string> = {
  COMMON: "bg-slate-500/10 text-slate-400",
  UNCOMMON: "bg-green-500/10 text-green-400",
  RARE: "bg-blue-500/10 text-blue-400",
  ULTRA_RARE: "bg-purple-500/10 text-purple-400",
  SECRET_RARE: "bg-yellow-500/10 text-yellow-400",
  BANGER: "bg-orange-500/10 text-orange-400",
  GRAIL: "bg-pink-500/10 text-pink-400",
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
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Order Details</h1>
              <Badge variant="outline" className={status.className}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              {order.id}
            </p>
          </div>
        </div>
        <OrderActions order={order} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {order.product.imageUrl ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted shrink-0">
                    <Image
                      src={order.product.imageUrl}
                      alt={order.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {order.product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From: {order.packName}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/products/${order.product.id}`}>
                        <ExternalLink className="mr-2 h-3 w-3" />
                        View Product
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        tierConfig[order.selectedTier] || tierConfig.COMMON
                      )}
                    >
                      {order.selectedTier.replace("_", " ")}
                    </Badge>
                    <span className="text-2xl font-bold">
                      ${Number(order.product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {order.customerName || order.user?.name || "Guest"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {order.customerEmail || order.user?.email || "—"}
                  </p>
                </div>
              </div>
              {order.user && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Registered User
                      </p>
                      <p className="font-mono text-sm">{order.user.id}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/users/${order.user.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-2xl font-bold">
                    ${(order.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <Badge variant="outline" className={status.className}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </div>
              {order.stripeSessionId && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stripe Session ID
                    </p>
                    <p className="font-mono text-sm break-all">
                      {order.stripeSessionId}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="w-px h-full bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(order.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>

                {order.status === "COMPLETED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Payment Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "FAILED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Payment Failed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "REFUNDED" && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-500/10 flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Order Refunded</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(order.updatedAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pack ID</span>
                <span className="font-mono text-sm">
                  {order.packId.slice(0, 8)}...
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product ID</span>
                <span className="font-mono text-sm">
                  {order.productId.slice(0, 8)}...
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-sm">
                  {format(new Date(order.createdAt), "PP")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-sm">
                  {format(new Date(order.updatedAt), "PP")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
