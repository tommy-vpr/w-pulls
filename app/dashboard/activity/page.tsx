import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

const actionColors: Record<string, string> = {
  CREATED: "bg-green-500",
  UPDATED: "bg-blue-500",
  DELETED: "bg-red-500",
  INVENTORY_INCREASED: "bg-emerald-500",
  INVENTORY_DECREASED: "bg-orange-500",
  PRICE_CHANGED: "bg-purple-500",
  STATUS_CHANGED: "bg-yellow-500",
  TIER_CHANGED: "bg-pink-500",
  PAYMENT_COMPLETED: "bg-green-500",
  PAYMENT_FAILED: "bg-red-500",
  REFUND_COMPLETED: "bg-amber-500",
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
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground">
          Track all changes to products and orders
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Product Activity</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {productAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-start gap-3 border-b pb-3"
                >
                  <Badge
                    className={`${
                      actionColors[audit.action] || "bg-gray-500"
                    } text-white text-xs`}
                  >
                    {audit.action.replace("_", " ")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {audit.product?.title || "Deleted Product"}
                    </p>
                    {audit.field && (
                      <p className="text-xs text-muted-foreground">
                        {audit.field}: {audit.oldValue} → {audit.newValue}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(audit.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Order Activity</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {orderAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-start gap-3 border-b pb-3"
                >
                  <Badge
                    className={`${
                      actionColors[audit.action] || "bg-gray-500"
                    } text-white text-xs`}
                  >
                    {audit.action.replace("_", " ")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {audit.order?.packName} - $
                      {((audit.order?.amount || 0) / 100).toFixed(2)}
                    </p>
                    {audit.oldStatus && audit.newStatus && (
                      <p className="text-xs text-muted-foreground">
                        {audit.oldStatus} → {audit.newStatus}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(audit.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
