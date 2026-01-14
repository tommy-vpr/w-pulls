import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const actionConfig: Record<string, { bg: string; text: string }> = {
  CREATED: { bg: "bg-emerald-900/40", text: "text-emerald-400" },
  UPDATED: { bg: "bg-blue-900/40", text: "text-blue-400" },
  DELETED: { bg: "bg-red-900/40", text: "text-red-400" },
  INVENTORY_INCREASED: { bg: "bg-green-900/40", text: "text-green-400" },
  INVENTORY_DECREASED: { bg: "bg-orange-900/40", text: "text-orange-400" },
  PRICE_CHANGED: { bg: "bg-purple-900/40", text: "text-purple-400" },
  STATUS_CHANGED: { bg: "bg-yellow-900/40", text: "text-yellow-400" },
  TIER_CHANGED: { bg: "bg-pink-900/40", text: "text-pink-400" },
  PAYMENT_COMPLETED: { bg: "bg-emerald-900/40", text: "text-emerald-400" },
  PAYMENT_FAILED: { bg: "bg-red-900/40", text: "text-red-400" },
  REFUND_COMPLETED: { bg: "bg-amber-900/40", text: "text-amber-400" },
};

export default async function AuditPage() {
  const [productAudits, orderAudits] = await Promise.all([
    prisma.productAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        product: { select: { id: true, title: true, sku: true } },
      },
    }),
    prisma.orderAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: { select: { id: true, packName: true, amount: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Activity</h1>
        <p className="text-zinc-500">
          Track all changes to products and orders
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Audits */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">
              Product Activity
            </h2>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="space-y-3">
              {productAudits.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">
                  No product activity yet
                </p>
              ) : (
                productAudits.map((audit) => {
                  const config = actionConfig[audit.action] || {
                    bg: "bg-zinc-800",
                    text: "text-zinc-400",
                  };
                  return (
                    <div
                      key={audit.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config.bg} ${config.text} border border-current/20`}
                      >
                        {audit.action.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {audit.product?.title || "Deleted Product"}
                        </p>
                        {audit.field && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            <span className="text-zinc-400">
                              {audit.field}:
                            </span>{" "}
                            <span className="text-red-400/70">
                              {audit.oldValue}
                            </span>
                            <span className="text-zinc-600 mx-1">→</span>
                            <span className="text-emerald-400/70">
                              {audit.newValue}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          {formatDistanceToNow(audit.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Order Audits */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">
              Order Activity
            </h2>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="space-y-3">
              {orderAudits.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-8">
                  No order activity yet
                </p>
              ) : (
                orderAudits.map((audit) => {
                  const config = actionConfig[audit.action] || {
                    bg: "bg-zinc-800",
                    text: "text-zinc-400",
                  };
                  return (
                    <div
                      key={audit.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config.bg} ${config.text} border border-current/20`}
                      >
                        {audit.action.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {audit.order?.packName}{" "}
                          <span className="text-zinc-500">
                            - ${((audit.order?.amount || 0) / 100).toFixed(2)}
                          </span>
                        </p>
                        {audit.oldStatus && audit.newStatus && (
                          <p className="text-xs text-zinc-500 mt-0.5">
                            <span className="text-red-400/70">
                              {audit.oldStatus}
                            </span>
                            <span className="text-zinc-600 mx-1">→</span>
                            <span className="text-emerald-400/70">
                              {audit.newStatus}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          {formatDistanceToNow(audit.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
