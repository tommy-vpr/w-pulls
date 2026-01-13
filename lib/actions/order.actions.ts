"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { orderService, SerializedOrder } from "@/lib/services/order.service";
import { OrderFilters } from "@/lib/repositories/order.repository";
import {
  PaginationParams,
  PaginatedResult,
  ActionResponse,
} from "@/types/product";

// In lib/actions/order.actions.ts
export async function getOrders(
  filters: OrderFilters = {},
  pagination: PaginationParams = {}
): Promise<ActionResponse<PaginatedResult<SerializedOrder>>> {
  const result = await orderService.getOrders(filters, pagination);

  if (!result.success) {
    console.error("getOrders failed:", result.error);
  }

  return result;
}

export async function getOrderById(
  id: string
): Promise<ActionResponse<SerializedOrder>> {
  return orderService.getOrderById(id);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ActionResponse> {
  const result = await orderService.updateOrderStatus(id, status);

  if (result.success) {
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
  }

  return result;
}

export async function getOrderStats() {
  return orderService.getStats();
}

export async function getRecentOrders(limit: number = 5) {
  return orderService.getRecentOrders(limit);
}

export async function refundOrder(id: string): Promise<ActionResponse> {
  const result = await orderService.refundOrder(id);

  if (result.success) {
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
  }

  return result;
}

export async function deleteOrder(id: string): Promise<ActionResponse> {
  const result = await orderService.deleteOrder(id);

  if (result.success) {
    revalidatePath("/dashboard/orders");
  }

  return result;
}
