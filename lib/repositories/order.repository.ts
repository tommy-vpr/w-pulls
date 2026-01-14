// lib/repositories/order.repository.ts

import prisma from "@/lib/prisma";
import { Order, OrderStatus, ProductTier, Prisma } from "@prisma/client";
import { PaginationParams, PaginatedResult } from "@/types/product";

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  userId?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderWithProduct extends Order {
  product: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: Prisma.Decimal;
    tier: ProductTier;
    category: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

// Standard product select to reuse
const productSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  price: true,
  tier: true,
  category: true,
} as const;

const userSelect = {
  id: true,
  name: true,
  email: true,
} as const;

export class OrderRepository {
  /**
   * Find order by ID with product details
   */
  async findById(id: string): Promise<OrderWithProduct | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: productSelect },
        user: { select: userSelect },
      },
    });
  }

  /**
   * Find order by Stripe session ID
   */
  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    return prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
    });
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Update order
   */
  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Get paginated orders with filters
   */
  async findMany(
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<OrderWithProduct>> {
    const { status, search, userId, productId, dateFrom, dateTo } = filters;
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { packName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { product: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: productSelect },
          user: { select: userSelect },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get order statistics
   */
  async getStats(): Promise<OrderStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      revenueResult,
      todayOrders,
      todayRevenueResult,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "FAILED" } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.order.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      failedOrders,
      totalRevenue: (revenueResult._sum.amount || 0) / 100,
      todayOrders,
      todayRevenue: (todayRevenueResult._sum.amount || 0) / 100,
    };
  }

  /**
   * Get orders by user ID
   */
  async findByUserId(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<OrderWithProduct>> {
    return this.findMany({ userId }, pagination);
  }

  /**
   * Get recent orders
   */
  async getRecent(limit: number = 5): Promise<OrderWithProduct[]> {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: productSelect },
        user: { select: userSelect },
      },
    });
  }

  /**
   * Delete an order
   */
  async delete(id: string): Promise<Order> {
    return prisma.order.delete({
      where: { id },
    });
  }
}

export const orderRepository = new OrderRepository();
