// lib/repositories/user.repository.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    wallet: true;
    _count: {
      select: {
        orders: true;
        walletTransactions: true;
        withdrawals: true;
      };
    };
  };
}>;

export type UserDetail = Prisma.UserGetPayload<{
  include: {
    wallet: true;
    orders: {
      include: {
        items: {
          include: {
            product: true;
          };
        };
      };
    };
    withdrawals: true;
    walletTransactions: true;
    _count: {
      select: {
        orders: true;
        walletTransactions: true;
        withdrawals: true;
      };
    };
  };
}>;

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class UserRepository {
  async getUsers(params: GetUsersParams = {}) {
    const {
      page = 1,
      pageSize = 25,
      search,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search } },
      ];
    }

    if (role && role !== "ALL") {
      where.role = role as any;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          wallet: true,
          _count: {
            select: {
              orders: true,
              walletTransactions: true,
              withdrawals: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, pageSize };
  }

  async getUserById(id: string): Promise<UserDetail | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        walletTransactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        _count: {
          select: {
            orders: true,
            walletTransactions: true,
            withdrawals: true,
          },
        },
      },
    });
  }

  async updateUserRole(id: string, role: "USER" | "ADMIN") {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}

export const userRepository = new UserRepository();
