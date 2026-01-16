// lib/repositories/collection.repository.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type CollectionOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export class CollectionRepository {
  async getUserCollection(userId: string): Promise<CollectionOrder[]> {
    return prisma.order.findMany({
      where: {
        userId,
        status: "COMPLETED",
        items: {
          some: {}, // ✅ at least one item
        },
      },
      include: {
        items: {
          include: {
            product: true, // ✅ product now lives here
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const collectionRepository = new CollectionRepository();
