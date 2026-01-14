import { Loader2 } from "lucide-react";

/**
 * Dashboard page loading skeleton
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-zinc-800/60 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
            </div>
            <div className="h-8 w-20 bg-zinc-800 rounded mb-1" />
            <div className="h-3 w-28 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-4 flex items-center gap-4 animate-pulse"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="h-12 w-12 rounded-lg bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-zinc-800 rounded" />
                  <div className="h-3 w-24 bg-zinc-800/60 rounded" />
                </div>
                <div className="h-6 w-20 bg-zinc-800 rounded-md" />
                <div className="h-4 w-16 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="h-5 w-28 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-zinc-800 rounded-lg animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Activity or Chart Placeholder */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="p-6 flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Cards Grid */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="h-5 w-36 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-800/30 overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-square bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-zinc-700 rounded" />
                  <div className="h-4 w-full bg-zinc-700 rounded" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-12 bg-zinc-700 rounded" />
                    <div className="h-4 w-12 bg-zinc-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin dashboard loading skeleton
 */
export function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-72 bg-zinc-800/60 rounded animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
            </div>
            <div className="h-8 w-24 bg-zinc-800 rounded mb-1" />
            <div className="h-3 w-20 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="p-6 h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center gap-4 animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-zinc-800 rounded" />
                <div className="h-3 w-32 bg-zinc-800/60 rounded" />
              </div>
              <div className="h-6 w-20 bg-zinc-800 rounded-md" />
              <div className="h-6 w-16 bg-zinc-800 rounded-md" />
              <div className="h-4 w-20 bg-zinc-800 rounded" />
              <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * User dashboard loading skeleton
 */
export function UserDashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 w-28 bg-zinc-800 rounded mb-3" />
            <div className="h-8 w-16 bg-zinc-800 rounded mb-1" />
            <div className="h-3 w-20 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Best Pull Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="p-6 flex gap-6">
          <div className="h-32 w-24 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-8 w-24 bg-zinc-800 rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Recent Orders Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="aspect-square bg-zinc-800" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-20 bg-zinc-700 rounded" />
                <div className="h-5 w-full bg-zinc-700 rounded" />
                <div className="flex justify-between pt-2 border-t border-zinc-800">
                  <div className="h-4 w-16 bg-zinc-700 rounded" />
                  <div className="h-4 w-16 bg-zinc-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-zinc-800 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
