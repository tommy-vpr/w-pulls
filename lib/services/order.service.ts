import { Order, OrderStatus } from "@prisma/client";
import {
  orderRepository,
  OrderRepository,
  OrderFilters,
  OrderWithProduct,
  OrderStats,
} from "@/lib/repositories/order.repository";
import {
  PaginationParams,
  PaginatedResult,
  ActionResponse,
} from "@/types/product";
import { auditService } from "./audit.service";

export interface SerializedOrder {
  id: string;
  packId: string;
  packName: string;
  amount: number;
  productId: string | null;
  userId: string | null;
  selectedTier: string | null;
  status: string;
  stripeSessionId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: string;
    tier: string;
    category: string;
  } | null;
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
  serializeOrder(order: OrderWithProduct): SerializedOrder {
    return {
      id: order.id,
      packId: order.packId,
      packName: order.packName,
      amount: order.amount,
      productId: order.productId,
      userId: order.userId,
      selectedTier: order.selectedTier,
      status: order.status,
      stripeSessionId: order.stripeSessionId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      product: order.product
        ? {
            id: order.product.id,
            title: order.product.title,
            description: order.product.description,
            imageUrl: order.product.imageUrl,
            price: order.product.price.toString(),
            tier: order.product.tier,
            category: order.product.category,
          }
        : null,
      user: order.user,
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
    pagination: PaginationParams = {}
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
    status: OrderStatus
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
    limit: number = 5
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
    pagination: PaginationParams = {}
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
