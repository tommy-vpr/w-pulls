"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeProduct } from "@/types/product";

export async function getUserOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (params?.status && params.status !== "all") {
      where.status = params.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const serializedOrders = orders.map((order) => ({
      id: order.id,
      packId: order.packId,
      packName: order.packName,
      amount: order.amount,
      selectedTier: order.selectedTier, // Can be null
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      product: order.product ? serializeProduct(order.product) : null, // Handle nullable
    }));

    return {
      success: true,
      data: {
        orders: serializedOrders,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    };
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

export async function getUserOrderStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [total, completed, pending, totalSpent, tierCounts] =
      await Promise.all([
        prisma.order.count({
          where: { userId: session.user.id },
        }),
        prisma.order.count({
          where: { userId: session.user.id, status: "COMPLETED" },
        }),
        prisma.order.count({
          where: { userId: session.user.id, status: "PENDING" },
        }),
        prisma.order.aggregate({
          where: { userId: session.user.id, status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.order.groupBy({
          by: ["selectedTier"],
          where: {
            userId: session.user.id,
            status: "COMPLETED",
            selectedTier: { not: null }, // Filter out null tiers
          },
          _count: true,
        }),
      ]);

    const tierStats = tierCounts.reduce((acc, curr) => {
      if (curr.selectedTier) {
        acc[curr.selectedTier] = curr._count;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        total,
        completed,
        pending,
        totalSpent: (totalSpent._sum.amount || 0) / 100, // Convert cents to dollars
        tierStats,
      },
    };
  } catch (error) {
    console.error("Failed to fetch user order stats:", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
