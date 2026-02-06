import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional text to display below spinner */
  text?: string;
  /** Display mode */
  variant?: "inline" | "fullscreen" | "overlay" | "container";
  /** Additional classes */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export const ProductDetailLoading = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Skeleton className="h-4 w-32 bg-zinc-800" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Image */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Skeleton className="aspect-square w-full bg-zinc-800" />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            {/* Tier Badge */}
            <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />

            {/* Title */}
            <Skeleton className="h-8 w-3/4 bg-zinc-800" />

            {/* Category */}
            <Skeleton className="h-4 w-32 bg-zinc-800" />

            {/* Price */}
            <Skeleton className="h-10 w-28 bg-zinc-800" />

            {/* Status */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md bg-zinc-800" />
              <Skeleton className="h-4 w-24 bg-zinc-800" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <Skeleton className="h-4 w-20 bg-zinc-800 mb-2" />
                <Skeleton className="h-6 w-16 bg-zinc-800" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-lg bg-zinc-800" />
            <Skeleton className="h-10 w-24 rounded-lg bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <Skeleton className="h-5 w-28 bg-zinc-800" />
        </div>
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-3/4 bg-zinc-800" />
        </div>
      </div>

      {/* Details Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </div>
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between"
            >
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-4 w-32 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Audit History */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <Skeleton className="h-5 w-28 bg-zinc-800" />
          <Skeleton className="h-4 w-16 bg-zinc-800" />
        </div>
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 bg-zinc-800" />
                <Skeleton className="h-3 w-32 bg-zinc-800" />
              </div>
              <Skeleton className="h-4 w-24 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProductsLoading = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 bg-zinc-800" />
          <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64 bg-zinc-800" />
        <Skeleton className="h-10 w-40 bg-zinc-800" />
        <Skeleton className="h-10 w-40 bg-zinc-800" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-zinc-800" />
              <Skeleton className="h-3 w-24 bg-zinc-800" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
            <Skeleton className="h-6 w-16 rounded-md bg-zinc-800" />
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-8 bg-zinc-800" />
            <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg bg-zinc-800" />
        ))}
      </div>
    </div>
  );
};

export const OrdersLoading = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 bg-zinc-800" />
          <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-32 bg-zinc-800" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
            </div>
            <Skeleton className="h-8 w-20 bg-zinc-800" />
            <Skeleton className="h-3 w-16 mt-2 bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64 bg-zinc-800" />
        <Skeleton className="h-10 w-40 bg-zinc-800" />
        <Skeleton className="h-10 w-40 bg-zinc-800" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
          </div>
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4"
          >
            <Skeleton className="h-12 w-12 rounded-lg bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-zinc-800" />
              <Skeleton className="h-3 w-24 bg-zinc-800" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md bg-zinc-800" />
            <Skeleton className="h-6 w-16 rounded-md bg-zinc-800" />
            <Skeleton className="h-4 w-16 bg-zinc-800" />
            <Skeleton className="h-4 w-8 bg-zinc-800" />
            <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg bg-zinc-800" />
        ))}
      </div>
    </div>
  );
};

export const OrderDetailLoading = () => {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32 bg-zinc-800" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
        <Skeleton className="h-7 w-48 bg-zinc-800" />
        <Skeleton className="h-4 w-64 bg-zinc-800" />
        <Skeleton className="h-10 w-full bg-zinc-800" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex gap-6">
            <Skeleton className="h-36 w-28 rounded-lg bg-zinc-800" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4 bg-zinc-800" />
              <Skeleton className="h-4 w-40 bg-zinc-800" />
              <Skeleton className="h-6 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-32 bg-zinc-800" />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full bg-zinc-800" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
            <Skeleton className="h-5 w-24 bg-zinc-800" />
            <Skeleton className="h-4 w-full bg-zinc-800" />
            <Skeleton className="h-6 w-32 bg-zinc-800" />
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <Skeleton className="h-4 w-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function LoadingSpinner({
  size = "md",
  text,
  variant = "inline",
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2
        className={cn("animate-spin text-violet-500", sizeClasses[size])}
      />
      {text && (
        <p className={cn("text-zinc-400 animate-pulse", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  // Inline - just the spinner
  if (variant === "inline") {
    return spinner;
  }

  // Container - fills parent container
  if (variant === "container") {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    );
  }

  // Overlay - covers parent with backdrop
  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  // Fullscreen - covers entire viewport
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      {spinner}
    </div>
  );
}

/**
 * Full page loading screen with branding
 */
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
      {/* Gradient glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />

      {/* Spinner with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-violet-500/30 animate-pulse" />
        <Loader2 className="relative h-12 w-12 animate-spin text-violet-500" />
      </div>

      {/* Text */}
      <p className="mt-4 text-zinc-400 animate-pulse">{text}</p>
    </div>
  );
}

/**
 * Section loader - for loading states within a page section
 */
export function SectionLoader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-96 w-full flex-col items-center justify-center",
        className,
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      {text && <p className="mt-3 text-sm text-zinc-500">{text}</p>}
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-zinc-800" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-1/3 bg-zinc-800 rounded" />
            <div className="h-5 w-2/3 bg-zinc-800 rounded" />
            <div className="flex justify-between pt-3 border-t border-zinc-800">
              <div className="h-4 w-16 bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton loader for table rows
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-zinc-800 rounded animate-pulse"
            style={{ width: `${Math.random() * 60 + 40}px` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4 animate-pulse"
        >
          <div className="h-10 w-10 rounded-lg bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-zinc-800 rounded" />
            <div className="h-3 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="h-6 w-20 bg-zinc-800 rounded-md" />
          <div className="h-6 w-16 bg-zinc-800 rounded-md" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
          <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * Two-column table skeleton (for detail pages, settings, key-value displays)
 */
export function TwoColumnTableSkeleton({
  rows = 6,
  withHeader = false,
  headerText,
}: {
  rows?: number;
  withHeader?: boolean;
  headerText?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {withHeader && (
        <div className="px-6 py-4 border-b border-zinc-800">
          {headerText ? (
            <h3 className="text-lg font-semibold text-zinc-100">
              {headerText}
            </h3>
          ) : (
            <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
          )}
        </div>
      )}
      <div className="divide-y divide-zinc-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 flex items-center justify-between animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="h-4 w-24 bg-zinc-800 rounded" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for stats cards
 */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
        >
          <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
          <div className="h-8 w-20 bg-zinc-800 rounded mb-1" />
          <div className="h-3 w-16 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Order detail page skeleton
 */
export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Back link */}
      <div className="h-4 w-32 bg-zinc-800 rounded" />

      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-7 w-40 bg-zinc-800 rounded" />
              <div className="h-6 w-24 bg-zinc-800 rounded-md" />
            </div>
            <div className="h-4 w-64 bg-zinc-800/60 rounded" />
          </div>
          <div className="text-right space-y-1">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-5 w-32 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="h-5 w-24 bg-zinc-800 rounded" />
            </div>
            <div className="p-6 flex gap-6">
              <div className="h-40 w-32 bg-zinc-800 rounded-lg" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-zinc-800 rounded" />
                <div className="h-4 w-32 bg-zinc-800/60 rounded" />
                <div className="h-8 w-24 bg-zinc-800 rounded-md" />
                <div className="h-8 w-20 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="h-5 w-32 bg-zinc-800 rounded" />
            </div>
            <div className="p-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 bg-zinc-800 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                    <div className="h-3 w-48 bg-zinc-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TwoColumnTableSkeleton rows={4} withHeader headerText="Payment" />
          <TwoColumnTableSkeleton rows={3} withHeader headerText="Shipping" />
        </div>
      </div>
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-10 w-full bg-zinc-800 rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <div className="h-10 w-24 bg-zinc-800 rounded-lg" />
        <div className="h-10 w-20 bg-zinc-800/60 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Profile/Settings page skeleton
 */
export function ProfileSettingsSkeleton() {
  return (
    <div className="animate-pulse max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-zinc-800 rounded" />
        <div className="h-4 w-48 bg-zinc-800/60 rounded" />
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-5 flex items-center justify-between"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="space-y-1">
              <div className="h-4 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-40 bg-zinc-800/60 rounded" />
            </div>
            <div className="h-9 w-24 bg-zinc-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
