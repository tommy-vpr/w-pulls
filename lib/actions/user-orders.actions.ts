// lib/actions/user-order.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { orderService } from "@/lib/services/order.service";
import { OrderStatus } from "@prisma/client";

export async function getUserOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const filters = {
    userId: session.user.id,
    status:
      params?.status && params.status !== "all"
        ? (params.status as OrderStatus)
        : undefined,
  };

  return orderService.getOrders(filters, {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
  });
}

export async function getUserOrderStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  return orderService.getUserOrderStats(session.user.id);
}

// "use server";

// import prisma from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import { OrderStatus, OrderType, ProductTier, Prisma } from "@prisma/client";
// import { serializeProduct, SerializedProduct } from "@/types/product";

// export interface SerializedUserOrderItem {
//   id: string;
//   quantity: number;
//   unitPrice: string;
//   product: SerializedProduct | null;
// }

// export interface SerializedUserOrder {
//   id: string;
//   type: OrderType;
//   packId: string | null;
//   packName: string | null;
//   amount: number;
//   selectedTier: ProductTier | null;
//   status: OrderStatus;
//   createdAt: string;
//   updatedAt: string;

//   items: SerializedUserOrderItem[];
//   product: SerializedProduct | null; // backward compat
// }

// export async function getUserOrders(params?: {
//   status?: string;
//   page?: number;
//   limit?: number;
// }) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       return { success: false, error: "Unauthorized" };
//     }

//     const page = params?.page ?? 1;
//     const limit = params?.limit ?? 10;
//     const skip = (page - 1) * limit;

//     const where: Prisma.OrderWhereInput = {
//       userId: session.user.id,
//     };

//     if (params?.status && params.status !== "all") {
//       // Explicit filter from UI
//       where.status = params.status as OrderStatus;
//     } else {
//       // ✅ Hide abandoned PRODUCT checkouts ONLY
//       where.NOT = {
//         type: "PRODUCT",
//         status: "PENDING",
//       };
//     }

//     const [orders, total] = await Promise.all([
//       prisma.order.findMany({
//         where,
//         include: {
//           items: {
//             include: {
//               product: true,
//             },
//           },
//         },
//         orderBy: { createdAt: "desc" },
//         skip,
//         take: limit,
//       }),
//       prisma.order.count({ where }),
//     ]);

//     const serializedOrders: SerializedUserOrder[] = orders.map((order) => {
//       const firstItem = order.items[0] ?? null;

//       return {
//         id: order.id,
//         type: order.type,
//         packId: order.packId,
//         packName: order.packName,
//         amount: order.amount,
//         selectedTier: order.selectedTier,
//         status: order.status,
//         createdAt: order.createdAt.toISOString(),
//         updatedAt: order.updatedAt.toISOString(),

//         items: order.items.map((item) => ({
//           id: item.id,
//           quantity: item.quantity,
//           unitPrice: item.unitPrice.toString(),
//           product: item.product ? serializeProduct(item.product) : null,
//         })),

//         product: firstItem?.product
//           ? serializeProduct(firstItem.product)
//           : null,
//       };
//     });

//     return {
//       success: true,
//       data: {
//         orders: serializedOrders,
//         page,
//         totalPages: Math.ceil(total / limit),
//         total,
//       },
//     };
//   } catch (error) {
//     console.error("Failed to fetch user orders:", error);
//     return { success: false, error: "Failed to fetch orders" };
//   }
// }

// /* -------------------------------------------------- */
// /* USER ORDER STATS                                   */
// /* -------------------------------------------------- */

// export async function getUserOrderStats() {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return { success: false, error: "Unauthorized" };
//     }

//     const [total, completed, processing, totalSpent, tierCounts] =
//       await Promise.all([
//         // Total orders (excluding PENDING/abandoned)
//         prisma.order.count({
//           where: {
//             userId: session.user.id,
//             // status: { not: "PENDING" },
//             status: { notIn: ["PENDING", "ABANDONED"] },
//           },
//         }),
//         prisma.order.count({
//           where: { userId: session.user.id, status: "COMPLETED" },
//         }),
//         // Processing orders (paid, awaiting fulfillment)
//         prisma.order.count({
//           where: { userId: session.user.id, status: "PROCESSING" },
//         }),
//         // Total spent (only completed orders)
//         prisma.order.aggregate({
//           where: { userId: session.user.id, status: "COMPLETED" },
//           _sum: { amount: true },
//         }),
//         // Tier breakdown
//         prisma.order.groupBy({
//           by: ["selectedTier"],
//           where: {
//             userId: session.user.id,
//             status: "COMPLETED",
//             selectedTier: { not: null },
//           },
//           _count: true,
//         }),
//       ]);

//     const tierStats = tierCounts.reduce(
//       (acc, curr) => {
//         if (curr.selectedTier) {
//           acc[curr.selectedTier] = curr._count;
//         }
//         return acc;
//       },
//       {} as Record<string, number>,
//     );

//     return {
//       success: true,
//       data: {
//         total,
//         completed,
//         processing,
//         totalSpent: (totalSpent._sum.amount || 0) / 100,
//         tierStats,
//       },
//     };
//   } catch (error) {
//     console.error("Failed to fetch user order stats:", error);
//     return { success: false, error: "Failed to fetch stats" };
//   }
// }
