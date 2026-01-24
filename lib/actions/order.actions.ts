// lib/actions/order.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { orderService, SerializedOrder } from "@/lib/services/order.service";
import { OrderFilters } from "@/lib/repositories/order.repository";
import {
  PaginationParams,
  PaginatedResult,
  ActionResponse,
} from "@/types/product";

// ==========================================
// ADMIN ACTIONS (require admin role)
// ==========================================

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, error: "Unauthorized" };
  }
  if (session.user.role !== "ADMIN") {
    return { authorized: false, error: "Forbidden" };
  }
  return { authorized: true, userId: session.user.id };
}

export async function getOrders(
  filters: OrderFilters = {},
  pagination: PaginationParams = {},
): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  return orderService.getOrders(filters, pagination);
}

export async function getOrderById(
  id: string,
): Promise<ActionResponse<SerializedOrder>> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  return orderService.getOrderById(id);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResponse> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  const result = await orderService.updateOrderStatus(id, status);

  if (result.success) {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
  }

  return result;
}

export async function getOrderStats() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  return orderService.getStats();
}

export async function getRecentOrders(limit: number = 5) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  return orderService.getRecentOrders(limit);
}

export async function refundOrder(id: string): Promise<ActionResponse> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  const result = await orderService.refundOrder(id);

  if (result.success) {
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
  }

  return result;
}

export async function deleteOrder(id: string): Promise<ActionResponse> {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  const result = await orderService.deleteOrder(id);

  if (result.success) {
    revalidatePath("/admin/orders");
  }

  return result;
}

// ==========================================
// USER ACTIONS (require authenticated user)
// ==========================================

export async function getUserOrders(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const filters: OrderFilters = {
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

// User can view their own order details
export async function getUserOrderById(
  id: string,
): Promise<ActionResponse<SerializedOrder>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await orderService.getOrderById(id);

  // Verify ownership
  if (result.success && result.data?.user?.id !== session.user.id) {
    return { success: false, error: "Order not found" };
  }

  return result;
}

// // lib/actions/order.actions.ts
// "use server";

// import { revalidatePath } from "next/cache";
// import { OrderStatus } from "@prisma/client";
// import { orderService, SerializedOrder } from "@/lib/services/order.service";
// import { OrderFilters } from "@/lib/repositories/order.repository";
// import {
//   PaginationParams,
//   PaginatedResult,
//   ActionResponse,
// } from "@/types/product";

// export async function getOrders(
//   filters: OrderFilters = {},
//   pagination: PaginationParams = {},
// ): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
//   const result = await orderService.getOrders(filters, pagination);

//   if (!result.success) {
//     console.error("getOrders failed:", result.error);
//   }

//   return result;
// }

// export async function getOrderById(
//   id: string,
// ): Promise<ActionResponse<SerializedOrder>> {
//   return orderService.getOrderById(id);
// }

// export async function updateOrderStatus(
//   id: string,
//   status: OrderStatus,
// ): Promise<ActionResponse> {
//   const result = await orderService.updateOrderStatus(id, status);

//   if (result.success) {
//     revalidatePath("/dashboard/orders");
//     revalidatePath(`/dashboard/orders/${id}`);
//   }

//   return result;
// }

// export async function getOrderStats() {
//   return orderService.getStats();
// }

// export async function getRecentOrders(limit: number = 5) {
//   return orderService.getRecentOrders(limit);
// }

// export async function refundOrder(id: string): Promise<ActionResponse> {
//   const result = await orderService.refundOrder(id);

//   if (result.success) {
//     revalidatePath("/dashboard/orders");
//     revalidatePath(`/dashboard/orders/${id}`);
//   }

//   return result;
// }

// export async function deleteOrder(id: string): Promise<ActionResponse> {
//   const result = await orderService.deleteOrder(id);

//   if (result.success) {
//     revalidatePath("/dashboard/orders");
//   }

//   return result;
// }
