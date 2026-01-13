import { Suspense } from "react";
import { Metadata } from "next";
import {
  getUserOrders,
  getUserOrderStats,
} from "@/lib/actions/user-orders.actions";
import { OrdersGrid } from "./_components/orders-grid";
// import { OrdersStats } from "./_components/orders-stats";
import { OrdersFilter } from "./_components/orders-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders | WPulls",
  description: "View your mystery pack orders",
};

interface MyOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function MyOrdersPage({
  searchParams,
}: MyOrdersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status;

  const [ordersResult, statsResult] = await Promise.all([
    getUserOrders({ status, page, limit: 12 }),
    getUserOrderStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm">
            Track your mystery pack pulls
          </p>
        </div>
      </div>

      {/* Stats */}
      {/* <Suspense fallback={<StatsLoading />}>
        {statsResult.success && statsResult.data && (
          <OrdersStats stats={statsResult.data} />
        )}
      </Suspense> */}

      {/* Filter */}
      <OrdersFilter currentStatus={status} />

      {/* Orders Grid */}
      <Suspense fallback={<GridLoading />}>
        {ordersResult.success && ordersResult.data ? (
          ordersResult.data.orders.length > 0 ? (
            <OrdersGrid
              orders={ordersResult.data.orders}
              pagination={{
                page: ordersResult.data.page,
                totalPages: ordersResult.data.totalPages,
                total: ordersResult.data.total,
              }}
            />
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Failed to load orders
          </div>
        )}
      </Suspense>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function GridLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        You haven't opened any mystery packs yet. Head to the packs page to get
        started!
      </p>
    </div>
  );
}
