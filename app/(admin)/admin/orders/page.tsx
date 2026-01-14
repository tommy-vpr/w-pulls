import { Suspense } from "react";
import { Metadata } from "next";
import { getOrders, getOrderStats } from "@/lib/actions/order.actions";
import { OrdersTable } from "./_components/orders-table";
import { OrdersStats } from "./_components/orders-stats";
import { OrdersFilters } from "./_components/orders-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Orders | Dashboard",
  description: "Manage and view all orders",
};

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const status = params.status as any;
  const search = params.search;
  const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined;
  const dateTo = params.dateTo ? new Date(params.dateTo) : undefined;

  const [ordersResult, statsResult] = await Promise.all([
    getOrders(
      {
        status: status || undefined,
        search: search || undefined,
        dateFrom,
        dateTo,
      },
      { page, limit: 10 }
    ),
    getOrderStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-200">Orders</h1>
        <p className="text-muted-foreground">
          View and manage all mystery pack orders
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<StatsLoading />}>
        {statsResult.success && statsResult.data && (
          <OrdersStats stats={statsResult.data} />
        )}
      </Suspense>

      {/* Filters */}
      <OrdersFilters />

      {/* Orders Table */}
      <Suspense fallback={<TableLoading />}>
        {ordersResult.success && ordersResult.data ? (
          <OrdersTable
            orders={ordersResult.data.data}
            pagination={{
              page: ordersResult.data.page,
              totalPages: ordersResult.data.totalPages,
              total: ordersResult.data.total,
            }}
          />
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
