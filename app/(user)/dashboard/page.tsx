import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Trophy,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getTierConfig } from "@/lib/tier-config";
import { cn } from "@/lib/utils";
import { orderService, SerializedOrder } from "@/lib/services/order.service";
import { RecentOrdersGrid } from "@/components/ui/user/recent-orders-grid";

export default async function UserDashboardPage() {
  const session = await requireAuth();

  const [user, recentOrdersResult, revenueStats, packStats] = await Promise.all(
    [
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, createdAt: true },
      }),

      // Recent orders (PACK + PRODUCT, user scoped)
      orderService.getOrdersByUser(session.user.id, { limit: 8 }),

      // Revenue includes ALL completed orders
      prisma.order.aggregate({
        where: { userId: session.user.id, status: "COMPLETED" },
        _sum: { amount: true },
      }),

      // PACK stats only (source of truth for pack metrics)
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          type: "PACK",
          status: "COMPLETED",
        },
        _count: true,
      }),
    ],
  );

  const recentOrders: SerializedOrder[] =
    recentOrdersResult.success && recentOrdersResult.data
      ? recentOrdersResult.data.data
      : [];

  // 🔢 Pack metrics
  const totalPacksOpened = packStats._count || 0;

  const pendingReveals = recentOrders.filter(
    (o) => o.type === "PACK" && o.status === "COMPLETED" && !o.product,
  ).length;

  const completedPacks = totalPacksOpened - pendingReveals;

  const totalSpent = (revenueStats._sum.amount || 0) / 100;

  // 🏆 Best pull (highest tier revealed)
  const bestPull = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      type: "PACK",
      status: "COMPLETED",
      selectedTier: { in: ["GRAIL", "BANGER", "SECRET_RARE", "ULTRA_RARE"] },
      items: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              title: true,
              imageUrl: true,
              tier: true,
              price: true,
            },
          },
        },
      },
    },
  });

  const bestProduct = bestPull?.items[0]?.product;

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              {/* Welcome back, {user?.name?.split(" ")[0] || "there"}! */}
              {user?.name}
            </h1>
            <p className="text-zinc-500">
              {/* Here&apos;s what&apos;s happening with your packs */}
              {user?.email}
            </p>
          </div>
        </div>

        <Link
          href="/packs"
          className="flex items-center gap-2 px-6 h-10 rounded-md bg-gradient-to-br border border-purple-500
          from-violet-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition"
        >
          <Sparkles className="h-4 w-4" />
          Open Packs
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Packs Opened"
          value={totalPacksOpened.toString()}
          icon={Package}
          color="text-blue-400"
          bgColor="bg-blue-900/30"
          borderColor="border-blue-700/50"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon={DollarSign}
          color="text-emerald-400"
          bgColor="bg-emerald-900/30"
          borderColor="border-emerald-700/50"
        />
        <StatCard
          title="Unopened Packs"
          value={pendingReveals.toString()}
          icon={Clock}
          color="text-amber-400"
          bgColor="bg-amber-900/30"
          borderColor="border-amber-700/50"
        />
        <StatCard
          title="Completed Packs"
          value={completedPacks.toString()}
          icon={CheckCircle}
          color="text-emerald-400"
          bgColor="bg-emerald-900/30"
          borderColor="border-emerald-700/50"
        />
      </div>

      {/* Best Pull */}
      {bestProduct && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-100">
              Your Best Pull
            </h2>
          </div>
          <div className="p-6 flex gap-6">
            {bestProduct.imageUrl ? (
              <img
                src={bestProduct.imageUrl}
                alt={bestProduct.title}
                className="h-24 w-24 rounded-lg object-contain"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-zinc-600" />
              </div>
            )}

            <div>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border mb-2",
                  getTierConfig(bestProduct.tier).bgColor,
                  getTierConfig(bestProduct.tier).color,
                  getTierConfig(bestProduct.tier).borderColor,
                )}
              >
                {getTierConfig(bestProduct.tier).label}
              </span>
              <h3 className="text-xl text-gray-200">{bestProduct.title}</h3>
              <p className="text-emerald-400 font-medium">
                ${Number(bestProduct.price).toFixed(2)} value
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-100"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-8 w-8 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-zinc-100 font-medium">No orders yet</h3>
              <p className="text-zinc-500 text-sm mt-1">
                Open your first pack to get started!
              </p>
            </div>
          ) : (
            <RecentOrdersGrid orders={recentOrders} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-400">{title}</span>
        <div className={cn("p-2 rounded-lg border", bgColor, borderColor)}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </div>
      <div className="text-2xl text-zinc-100">{value}</div>
    </div>
  );
}

function QuickLinkCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 group-hover:bg-zinc-700 transition-colors">
          <Icon className="h-5 w-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-zinc-100 group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </Link>
  );
}
