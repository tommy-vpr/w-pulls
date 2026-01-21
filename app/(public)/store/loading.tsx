import { ProductGridSkeleton } from "./(components)/ProductCardSkeleton";

export default function StoreLoading() {
  return (
    <div className="min-h-screen mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-32 bg-zinc-800/50 rounded animate-pulse" />
          <div className="mt-2 h-5 w-48 bg-zinc-800/60 rounded animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-11 flex-1 max-w-md bg-zinc-800/50 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-zinc-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="h-4 w-24 bg-zinc-800/60 rounded mb-2 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-9 w-16 bg-zinc-800/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
