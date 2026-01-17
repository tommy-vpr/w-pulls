export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
          </div>

          {/* Right Column - Details Skeleton */}
          <div className="flex flex-col">
            {/* Tier Badge */}
            <div className="mb-4">
              <div className="h-7 w-20 bg-zinc-800 rounded-lg animate-pulse" />
            </div>

            {/* Title */}
            <div className="space-y-2 mb-4">
              <div className="h-8 w-3/4 bg-zinc-800 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Price */}
            <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse mb-6" />

            {/* Description */}
            <div className="mb-8">
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-zinc-800/60 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-800/60 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Details Box */}
            <div className="mb-8 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-zinc-800/60 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-zinc-800/60 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart Button Skeleton */}
            <div className="h-14 w-full bg-zinc-800 rounded-xl animate-pulse mb-8" />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-9 w-9 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-3 w-16 bg-zinc-800/60 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
