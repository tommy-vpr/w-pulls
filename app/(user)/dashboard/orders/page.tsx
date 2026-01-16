import { Suspense } from "react";
import { Metadata } from "next";
import {
  getUserOrders,
  getUserOrderStats,
} from "@/lib/actions/user-orders.actions";
import { OrdersGrid } from "./_components/orders-grid";
// import { OrdersStats } from "./_components/orders-stats";
import { OrdersFilter } from "./_components/orders-filter";
import { Package } from "lucide-react";
import { OrdersTable } from "./_components/orders-table";

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
        <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
          <Package className="h-6 w-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Orders</h1>
          <p className="text-zinc-500 text-sm">Track your mystery pack pulls</p>
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
      <div className="w-full">
        <Suspense fallback={<GridLoading />}>
          {ordersResult.success && ordersResult.data ? (
            ordersResult.data.orders.length > 0 ? (
              <OrdersTable
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
            <div className="text-center py-10 text-zinc-500">
              Failed to load orders
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function StatsLoading() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-zinc-800/50 animate-pulse" />
      ))}
    </div>
  );
}

function GridLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 rounded-xl bg-zinc-800/50 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700 mb-4">
        <Package className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-1">
        No orders yet
      </h3>
      <p className="text-zinc-500 text-sm max-w-sm">
        You haven't opened any mystery packs yet. Head to the packs page to get
        started!
      </p>
    </div>
  );
}
