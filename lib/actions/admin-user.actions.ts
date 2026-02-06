// lib/actions/admin-user.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { userService } from "@/lib/services/user.service";

// ─── Auth guard ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  // You can add a role check here if your session includes role
  // if (session.user.role !== "ADMIN") throw new Error("Not authorized");
  return session;
}

// ─── Actions ─────────────────────────────────────────────────

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getUsers(params: GetUsersParams = {}) {
  try {
    await requireAdmin();
    const result = await userService.getUsers(params);
    return { success: true as const, data: result };
  } catch (error) {
    console.error("[getUsers] Error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function getUserById(id: string) {
  try {
    await requireAdmin();
    const user = await userService.getUserById(id);
    if (!user) {
      return { success: false as const, error: "User not found" };
    }
    return { success: true as const, data: user };
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

export async function updateUserRole(id: string, role: "USER" | "ADMIN") {
  try {
    await requireAdmin();
    const user = await userService.updateUserRole(id, role);
    return { success: true as const, data: user };
  } catch (error) {
    console.error("[updateUserRole] Error:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}
