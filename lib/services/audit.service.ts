import prisma from "@/lib/prisma";
import {
  ProductAction,
  OrderAction,
  OrderStatus,
  Product,
  Order,
} from "@prisma/client";

interface AuditContext {
  performedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  // ==================== PRODUCT AUDITS ====================

  async logProductCreated(product: Product, context?: AuditContext) {
    return prisma.productAudit.create({
      data: {
        productId: product.id,
        action: "CREATED",
        newValue: JSON.stringify({
          title: product.title,
          price: product.price.toString(),
          tier: product.tier,
          inventory: product.inventory,
          category: product.category,
        }),
        ...context,
      },
    });
  }

  async logProductUpdated(
    productId: string,
    changes: { field: string; oldValue: any; newValue: any }[],
    context?: AuditContext
  ) {
    const audits = changes.map((change) => ({
      productId,
      action: this.getProductActionForField(
        change.field,
        change.oldValue,
        change.newValue
      ),
      field: change.field,
      oldValue: String(change.oldValue),
      newValue: String(change.newValue),
      ...context,
    }));

    return prisma.productAudit.createMany({
      data: audits,
    });
  }

  private getProductActionForField(
    field: string,
    oldValue?: any,
    newValue?: any
  ): ProductAction {
    switch (field) {
      case "price":
        return "PRICE_CHANGED";
      case "inventory":
        // Compare as numbers to determine increase vs decrease
        const oldNum = Number(oldValue) || 0;
        const newNum = Number(newValue) || 0;
        return newNum > oldNum ? "INVENTORY_INCREASED" : "INVENTORY_DECREASED";
      case "isActive":
        return "STATUS_CHANGED";
      case "tier":
        return "TIER_CHANGED";
      default:
        return "UPDATED";
    }
  }

  async logProductDeleted(product: Product, context?: AuditContext) {
    return prisma.productAudit.create({
      data: {
        productId: product.id,
        action: "DELETED",
        oldValue: JSON.stringify({
          title: product.title,
          price: product.price.toString(),
          tier: product.tier,
          inventory: product.inventory,
        }),
        ...context,
      },
    });
  }

  async logInventoryChange(
    productId: string,
    oldInventory: number,
    newInventory: number,
    reason?: string,
    context?: AuditContext
  ) {
    const action =
      newInventory > oldInventory
        ? "INVENTORY_INCREASED"
        : "INVENTORY_DECREASED";

    return prisma.productAudit.create({
      data: {
        productId,
        action,
        field: "inventory",
        oldValue: String(oldInventory),
        newValue: String(newInventory),
        metadata: reason ? { reason } : undefined,
        ...context,
      },
    });
  }

  // ==================== ORDER AUDITS ====================

  async logOrderCreated(order: Order, context?: AuditContext) {
    return prisma.orderAudit.create({
      data: {
        orderId: order.id,
        action: "CREATED",
        newStatus: order.status,
        metadata: {
          type: order.type,
          packId: order.packId ?? null,
          packName: order.packName ?? null,
          amount: order.amount,
        },
        ...context,
      },
    });
  }

  async logOrderStatusChange(
    orderId: string,
    oldStatus: OrderStatus,
    newStatus: OrderStatus,
    metadata?: Record<string, any>,
    context?: AuditContext
  ) {
    const action = this.getOrderActionForStatus(newStatus);

    return prisma.orderAudit.create({
      data: {
        orderId,
        action,
        oldStatus,
        newStatus,
        metadata,
        ...context,
      },
    });
  }

  async logPaymentEvent(
    orderId: string,
    event: "initiated" | "completed" | "failed",
    metadata?: Record<string, any>,
    context?: AuditContext
  ) {
    const actionMap = {
      initiated: "PAYMENT_INITIATED",
      completed: "PAYMENT_COMPLETED",
      failed: "PAYMENT_FAILED",
    } as const;

    return prisma.orderAudit.create({
      data: {
        orderId,
        action: actionMap[event],
        metadata,
        ...context,
      },
    });
  }

  async logRefundEvent(
    orderId: string,
    event: "initiated" | "completed",
    metadata?: Record<string, any>,
    context?: AuditContext
  ) {
    const actionMap = {
      initiated: "REFUND_INITIATED",
      completed: "REFUND_COMPLETED",
    } as const;

    return prisma.orderAudit.create({
      data: {
        orderId,
        action: actionMap[event],
        metadata,
        ...context,
      },
    });
  }

  async logProductRevealed(orderId: string, context?: AuditContext) {
    return prisma.orderAudit.create({
      data: {
        orderId,
        action: "PRODUCT_REVEALED",
        ...context,
      },
    });
  }

  private getOrderActionForStatus(status: OrderStatus): OrderAction {
    switch (status) {
      case "COMPLETED":
        return "PAYMENT_COMPLETED";
      case "FAILED":
        return "PAYMENT_FAILED";
      case "REFUNDED":
        return "REFUND_COMPLETED";
      default:
        return "STATUS_CHANGED";
    }
  }

  // ==================== QUERY AUDITS ====================

  async getProductAuditHistory(productId: string, limit = 50) {
    return prisma.productAudit.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getOrderAuditHistory(orderId: string) {
    return prisma.orderAudit.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRecentProductActivity(limit = 100) {
    return prisma.productAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: {
          select: { id: true, title: true, sku: true },
        },
      },
    });
  }

  async getRecentOrderActivity(limit = 100) {
    return prisma.orderAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            packName: true,
            amount: true,
            customerEmail: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();
