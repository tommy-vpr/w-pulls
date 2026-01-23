// lib/repositories/order.repository.ts

import prisma from "@/lib/prisma";
import { Order, OrderStatus, ProductTier, Prisma } from "@prisma/client";
import { PaginationParams, PaginatedResult } from "@/types/product";

// const hideUserInvisibleOrders: Prisma.OrderWhereInput = {
//   NOT: {
//     OR: [
//       // 🚫 PRODUCT checkout not completed
//       {
//         type: "PRODUCT",
//         status: "PENDING",
//       },

//       // 🚫 PACK checkout not yet revealed
//       {
//         type: "PACK",
//         status: { in: ["PENDING", "PROCESSING"] },
//       },
//     ],
//   },
// };

const hideUserInvisibleOrders: Prisma.OrderWhereInput = {
  AND: [
    // Never show abandoned orders
    { status: { not: "ABANDONED" } },

    // Hide incomplete orders by type
    {
      NOT: {
        OR: [
          {
            type: "PRODUCT",
            status: "PENDING",
          },
          {
            type: "PACK",
            status: { in: ["PENDING", "PROCESSING"] },
          },
        ],
      },
    },
  ],
};

/* ----------------------------------------
 * Filters
 * --------------------------------------*/

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  userId?: string;
  productId?: string; // filter via OrderItem
  dateFrom?: Date;
  dateTo?: Date;
}

/* ----------------------------------------
 * Typed payloads
 * --------------------------------------*/

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true;
            title: true;
            description: true;
            imageUrl: true;
            price: true;
            tier: true;
            category: true;
          };
        };
      };
    };
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

/* ----------------------------------------
 * Stats
 * --------------------------------------*/

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

/* ----------------------------------------
 * Repository
 * --------------------------------------*/

export class OrderRepository {
  /**
   * Find order by ID
   */
  async findById(id: string): Promise<OrderWithItems | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
   * Generic update
   */
  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  /**
   * Find many orders with filters
   */
  async findMany(
    filters: OrderFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<OrderWithItems>> {
    const { status, search, userId, productId, dateFrom, dateTo } = filters;
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...hideUserInvisibleOrders, // ✅ KEY LINE
    };

    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (productId) {
      where.items = {
        some: { productId },
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { packName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        {
          items: {
            some: {
              product: {
                title: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
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
   * Order statistics
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
   * Orders by user
   */
  async findByUserId(
    userId: string,
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<OrderWithItems>> {
    return this.findMany({ userId }, pagination);
  }

  /**
   * Recent orders
   */
  async getRecent(limit: number = 5): Promise<OrderWithItems[]> {
    return prisma.order.findMany({
      where: {
        ...hideUserInvisibleOrders, // ✅ REQUIRED
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<Order> {
    return prisma.order.delete({
      where: { id },
    });
  }

  /**
   * Get user order statistics
   */
  async getUserStats(userId: string) {
    const [total, completed, processing, totalSpent, tierCounts] =
      await Promise.all([
        prisma.order.count({
          where: {
            userId,
            status: { notIn: ["PENDING", "ABANDONED"] },
          },
        }),
        prisma.order.count({
          where: { userId, status: "COMPLETED" },
        }),
        prisma.order.count({
          where: { userId, status: "PROCESSING" },
        }),
        prisma.order.aggregate({
          where: { userId, status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.order.groupBy({
          by: ["selectedTier"],
          where: {
            userId,
            status: "COMPLETED",
            selectedTier: { not: null },
          },
          _count: true,
        }),
      ]);

    return {
      total,
      completed,
      processing,
      totalSpentCents: totalSpent._sum.amount || 0,
      tierCounts,
    };
  }
}

export const orderRepository = new OrderRepository();
