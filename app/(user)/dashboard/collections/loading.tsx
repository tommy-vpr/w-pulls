// app/(user)/dashboard/orders/loading.tsx
import { CardSkeleton } from "@/components/ui/loadings";

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton count={8} />
      </div>
    </div>
  );
}
