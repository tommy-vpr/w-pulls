// lib/services/user.service.ts
import { UserRole, OrderStatus, WithdrawalStatus } from "@prisma/client";
import {
  userRepository,
  GetUsersParams,
  UserWithRelations,
  UserDetail,
} from "@/lib/repositories/user.repository";

// ─── Serialized types ────────────────────────────────────────

export interface SerializedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  walletBalance: number; // dollars
  orderCount: number;
  totalSpent: number; // dollars
  stripeConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedUserDetail extends SerializedUser {
  emailVerified: string | null;
  stripeConnectedAccountId: string | null;
  stripeConnectOnboardedAt: string | null;
  withdrawalCount: number;
  transactionCount: number;
  orders: SerializedUserOrder[];
  withdrawals: SerializedWithdrawal[];
  recentTransactions: SerializedTransaction[];
}

export interface SerializedUserOrder {
  id: string;
  orderNumber: number;
  type: string;
  packName: string | null;
  amount: number; // dollars
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
}

export interface SerializedWithdrawal {
  id: string;
  amount: number; // dollars
  status: WithdrawalStatus;
  stripeTransferId: string | null;
  processedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface SerializedTransaction {
  id: string;
  type: string;
  amount: number; // dollars
  reason: string;
  balanceAfter: number; // dollars
  notes: string | null;
  createdAt: string;
}

export interface UserListResult {
  users: SerializedUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  totalWalletBalance: number; // dollars
}

// ─── Service ─────────────────────────────────────────────────

export class UserService {
  async getUsers(params: GetUsersParams): Promise<UserListResult> {
    const { users, total, page, pageSize } =
      await userRepository.getUsers(params);

    return {
      users: users.map((u) => this.serializeUser(u)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUserById(id: string): Promise<SerializedUserDetail | null> {
    const user = await userRepository.getUserById(id);
    if (!user) return null;

    return this.serializeUserDetail(user);
  }

  async updateUserRole(
    id: string,
    role: "USER" | "ADMIN",
  ): Promise<SerializedUser> {
    const updated = await userRepository.updateUserRole(id, role);
    // Re-fetch with relations for serialization
    const full = await userRepository.getUsers({
      search: updated.id,
      pageSize: 1,
    });
    return this.serializeUser(full.users[0]);
  }

  // ─── Private serializers ─────────────────────────────────

  private serializeUser(user: UserWithRelations): SerializedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      walletBalance: (user.wallet?.balance ?? 0) / 100,
      orderCount: user._count.orders,
      totalSpent: 0, // calculated from orders if needed
      stripeConnected: !!user.stripeConnectedAccountId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private serializeUserDetail(user: UserDetail): SerializedUserDetail {
    const totalSpent = user.orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      walletBalance: (user.wallet?.balance ?? 0) / 100,
      orderCount: user._count.orders,
      totalSpent: totalSpent / 100,
      stripeConnected: !!user.stripeConnectedAccountId,
      stripeConnectedAccountId: user.stripeConnectedAccountId,
      stripeConnectOnboardedAt:
        user.stripeConnectOnboardedAt?.toISOString() ?? null,
      withdrawalCount: user._count.withdrawals,
      transactionCount: user._count.walletTransactions,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orders: user.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        type: o.type,
        packName: o.packName,
        amount: o.amount / 100,
        status: o.status,
        itemCount: o.items.length,
        createdAt: o.createdAt.toISOString(),
      })),
      withdrawals: user.withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount / 100,
        status: w.status,
        stripeTransferId: w.stripeTransferId,
        processedAt: w.processedAt?.toISOString() ?? null,
        failedAt: w.failedAt?.toISOString() ?? null,
        failureReason: w.failureReason,
        createdAt: w.createdAt.toISOString(),
      })),
      recentTransactions: user.walletTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount / 100,
        reason: t.reason,
        balanceAfter: t.balanceAfter / 100,
        notes: t.notes,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }
}

export const userService = new UserService();
