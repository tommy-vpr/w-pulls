"use client";

export function ProductCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden bg-zinc-800">
        <div className="absolute inset-0 skeleton-shimmer" />

        {/* Tier Badge Skeleton */}
        <div className="absolute top-2 left-2">
          <div className="h-6 w-16 rounded-md bg-zinc-700 skeleton-shimmer" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-zinc-800 skeleton-shimmer" />

        {/* Description */}
        <div className="h-4 w-full rounded bg-zinc-800/60 skeleton-shimmer" />
        <div className="h-4 w-2/3 rounded bg-zinc-800/60 skeleton-shimmer" />

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="h-6 w-20 rounded bg-zinc-800 skeleton-shimmer" />
        </div>
      </div>

      <style jsx>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
