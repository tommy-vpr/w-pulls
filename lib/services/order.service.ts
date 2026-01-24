import { Order, OrderStatus } from "@prisma/client";
import {
  orderRepository,
  OrderRepository,
  OrderFilters,
  OrderWithItems,
  OrderStats,
} from "@/lib/repositories/order.repository";
import {
  PaginationParams,
  PaginatedResult,
  ActionResponse,
} from "@/types/product";
import { auditService } from "./audit.service";

export interface SerializedOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    description: string | null;
    price: string;
    tier: string;
    category: string;
  };
}

export interface SerializedOrder {
  id: string;
  type: string;
  orderNumber: number;

  packId: string | null;
  packName: string | null;

  // 💰 Stripe money (ALL IN CENTS)
  subtotal: number;
  tax: number;
  shipping: number;
  amount: number; // total paid

  selectedTier: string | null;
  status: string;
  stripeSessionId: string | null;
  customerEmail: string | null;
  customerName: string | null;

  // 📦 Shipping address (persisted on Order)
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;

  createdAt: string;
  updatedAt: string;

  items: SerializedOrderItem[];
  product: SerializedOrderItem["product"] | null;

  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export class OrderService {
  constructor(private repository: OrderRepository) {}

  /**
   * Serialize order for client
   */
  serializeOrder(order: OrderWithItems): SerializedOrder {
    const items = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      product: {
        id: item.product.id,
        title: item.product.title,
        imageUrl: item.product.imageUrl,
        description: item.product.description,
        price: item.product.price.toString(),
        tier: item.product.tier,
        category: item.product.category,
      },
    }));

    return {
      id: order.id,
      type: order.type,
      orderNumber: order.orderNumber,

      packId: order.packId,
      packName: order.packName,

      subtotal: order.subtotal ?? 0,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      amount: order.amount,

      selectedTier: order.selectedTier,
      status: order.status,
      stripeSessionId: order.stripeSessionId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,

      shippingLine1: order.shippingLine1,
      shippingLine2: order.shippingLine2,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,

      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),

      items,
      product: items[0]?.product ?? null,

      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
          }
        : null,
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<ActionResponse<SerializedOrder>> {
    try {
      const order = await this.repository.findById(id);
      if (!order) {
        return { success: false, error: "Order not found" };
      }
      return { success: true, data: this.serializeOrder(order) };
    } catch (error) {
      console.error("Error fetching order:", error);
      return { success: false, error: "Failed to fetch order" };
    }
  }

  /**
   * Get paginated orders
   */
  async getOrders(
    filters: OrderFilters = {},
    pagination: PaginationParams = {},
  ): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
    try {
      const result = await this.repository.findMany(filters, pagination);
      return {
        success: true,
        data: {
          ...result,
          data: result.data.map((order) => this.serializeOrder(order)),
        },
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { success: false, error: "Failed to fetch orders" };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<ActionResponse<Order>> {
    try {
      const existingOrder = await this.repository.findById(id);
      if (!existingOrder) {
        return { success: false, error: "Order not found" };
      }

      const oldStatus = existingOrder.status;
      const order = await this.repository.updateStatus(id, status);

      // Log audit
      await auditService.logOrderStatusChange(id, oldStatus, status);

      return { success: true, data: order };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { success: false, error: "Failed to update order status" };
    }
  }

  /**
   * Get order statistics
   */
  async getStats(): Promise<ActionResponse<OrderStats>> {
    try {
      const stats = await this.repository.getStats();
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      return { success: false, error: "Failed to fetch order statistics" };
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(
    limit: number = 5,
  ): Promise<ActionResponse<SerializedOrder[]>> {
    try {
      const orders = await this.repository.getRecent(limit);
      return {
        success: true,
        data: orders.map((order) => this.serializeOrder(order)),
      };
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      return { success: false, error: "Failed to fetch recent orders" };
    }
  }

  /**
   * Get orders by user
   */
  async getOrdersByUser(
    userId: string,
    pagination: PaginationParams = {},
  ): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
    try {
      const result = await this.repository.findByUserId(userId, pagination);
      return {
        success: true,
        data: {
          ...result,
          data: result.data.map((order) => this.serializeOrder(order)),
        },
      };
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return { success: false, error: "Failed to fetch user orders" };
    }
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: string): Promise<
    ActionResponse<{
      total: number;
      completed: number;
      processing: number;
      totalSpent: number;
      tierStats: Record<string, number>;
    }>
  > {
    try {
      const stats = await this.repository.getUserStats(userId);

      const tierStats = stats.tierCounts.reduce(
        (acc, curr) => {
          if (curr.selectedTier) {
            acc[curr.selectedTier] = curr._count;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        success: true,
        data: {
          total: stats.total,
          completed: stats.completed,
          processing: stats.processing,
          totalSpent: stats.totalSpentCents / 100,
          tierStats,
        },
      };
    } catch (error) {
      console.error("Error fetching user order stats:", error);
      return { success: false, error: "Failed to fetch stats" };
    }
  }

  /**
   * Delete an order (admin only)
   */
  async deleteOrder(id: string): Promise<ActionResponse<Order>> {
    try {
      const existingOrder = await this.repository.findById(id);
      if (!existingOrder) {
        return { success: false, error: "Order not found" };
      }

      const order = await this.repository.delete(id);
      return { success: true, data: order };
    } catch (error) {
      console.error("Error deleting order:", error);
      return { success: false, error: "Failed to delete order" };
    }
  }

  /**
   * Mark order as refunded
   */
  async refundOrder(id: string): Promise<ActionResponse<Order>> {
    try {
      const existingOrder = await this.repository.findById(id);
      if (!existingOrder) {
        return { success: false, error: "Order not found" };
      }

      if (existingOrder.status !== "COMPLETED") {
        return {
          success: false,
          error: "Only completed orders can be refunded",
        };
      }

      const order = await this.repository.updateStatus(id, "REFUNDED");

      // Log audit
      await auditService.logOrderStatusChange(id, "COMPLETED", "REFUNDED");

      return { success: true, data: order };
    } catch (error) {
      console.error("Error refunding order:", error);
      return { success: false, error: "Failed to refund order" };
    }
  }
}

export const orderService = new OrderService(orderRepository);
