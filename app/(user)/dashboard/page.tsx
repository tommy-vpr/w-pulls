import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
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
import { getTierConfig, isHighTier } from "@/lib/tier-config";
import { cn } from "@/lib/utils";
import { orderService, SerializedOrder } from "@/lib/services/order.service";
import { RecentOrdersGrid } from "@/components/ui/user/recent-orders-grid";

export default async function UserDashboardPage() {
  const session = await requireAuth();

  const [user, recentOrdersResult, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, createdAt: true },
    }),
    orderService.getRecentOrders(6), // ✅ serialized
    prisma.order.aggregate({
      where: { userId: session.user.id, status: "COMPLETED" },
      _count: true,
      _sum: { amount: true },
    }),
  ]);

  const recentOrders: SerializedOrder[] =
    recentOrdersResult.success && recentOrdersResult.data
      ? recentOrdersResult.data
      : [];

  // Get best pull (highest tier)
  const bestPull = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      selectedTier: { in: ["GRAIL", "BANGER", "SECRET_RARE", "ULTRA_RARE"] },
      items: {
        some: {}, // ensure at least one revealed item
      },
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

  const bestItem = bestPull?.items[0];
  const bestProduct = bestItem?.product;

  const totalOrders = stats._count || 0;
  const totalSpent = (stats._sum.amount || 0) / 100;
  const pendingOrders = recentOrders.filter(
    (o) => o.status === "PENDING"
  ).length;

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "Avatar"}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-violet-500/30"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Welcome back, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-zinc-500">
              Here&apos;s what&apos;s happening with your packs
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="group/btn relative h-10 px-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-600 font-medium text-white text-sm shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:opacity-50 disabled:cursor-not-allowed
          hover:opacity-85 transition flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Open Packs
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Packs Opened"
          value={totalOrders.toString()}
          icon={Package}
          color="text-blue-400"
          bgColor="bg-blue-900/30"
          borderColor="border-blue-700/50"
          accentColor="#3b82f6"
        />
        <StatCard
          title="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          icon={DollarSign}
          color="text-emerald-400"
          bgColor="bg-emerald-900/30"
          borderColor="border-emerald-700/50"
          accentColor="#10b981"
        />
        <StatCard
          title="Pending Reveals"
          value={pendingOrders.toString()}
          icon={Clock}
          color="text-amber-400"
          bgColor="bg-amber-900/30"
          borderColor="border-amber-700/50"
          accentColor="#f59e0b"
        />
        <StatCard
          title="Completed"
          value={(totalOrders - pendingOrders).toString()}
          icon={CheckCircle}
          color="text-emerald-400"
          bgColor="bg-emerald-900/30"
          borderColor="border-emerald-700/50"
          accentColor="#10b981"
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
          <div className="p-6">
            <div className="flex items-center gap-6">
              {bestProduct.imageUrl ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                  <img
                    src={bestProduct.imageUrl}
                    alt={bestProduct.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-zinc-600" />
                </div>
              )}
              <div className="flex-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border mb-2",
                    getTierConfig(bestProduct.tier).bgColor,
                    getTierConfig(bestProduct.tier).color,
                    getTierConfig(bestProduct.tier).borderColor
                  )}
                >
                  {getTierConfig(bestProduct.tier).label}
                </span>
                <h3 className="text-xl font-bold text-zinc-100">
                  {bestProduct.title}
                </h3>
                <p className="text-emerald-400 font-medium">
                  ${Number(bestProduct.price).toFixed(2)} value
                </p>
              </div>
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
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="rounded-full bg-zinc-800 p-4 w-fit mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="text-zinc-100 font-medium">No orders yet</h3>
              <p className="text-zinc-500 text-sm mt-1">
                Open your first pack to get started!
              </p>
              <Link
                href="/packs"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Browse Packs
              </Link>
            </div>
          ) : (
            <RecentOrdersGrid orders={recentOrders} />
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard
          href="/dashboard/orders"
          title="View All Orders"
          description="See your complete order history"
          icon={ShoppingBag}
        />
        <QuickLinkCard
          href="/dashboard/profile"
          title="Your Profile"
          description="View and edit your account info"
          icon={Package}
        />
        <QuickLinkCard
          href="/packs"
          title="Open More Packs"
          description="Try your luck with mystery packs"
          icon={Sparkles}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  accentColor = "#3b82f6",
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Corner glow accent */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: accentColor }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-400">{title}</span>
          <div className={cn("p-2 rounded-lg border", bgColor, borderColor)}>
            <Icon className={cn("h-4 w-4", color)} />
          </div>
        </div>
        <div className="text-2xl font-bold text-zinc-100">{value}</div>
      </div>
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
