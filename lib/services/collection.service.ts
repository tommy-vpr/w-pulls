// lib/services/collection.service.ts
import { ProductTier, ItemDisposition } from "@prisma/client";
import { collectionRepository } from "@/lib/repositories/collections.repository";

export interface SerializedCollectionItem {
  orderId: string;
  orderItemId: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  tier: ProductTier;
  value: number;
  packName: string | null;
  category: string;
  acquiredAt: string;
  // Disposition tracking
  disposition: ItemDisposition;
  buybackAmount: number | null;
  isSoldBack: boolean;
}

export interface CollectionSummary {
  totalItems: number;
  totalValue: number;
  tierCounts: Record<ProductTier, number>;
  // Sold-back tracking
  soldBackCount: number;
  soldBackValue: number;
}

export class CollectionService {
  async getUserCollection(userId: string) {
    const orders = await collectionRepository.getUserCollection(userId);

    const items: SerializedCollectionItem[] = [];
    const tierCounts: Record<ProductTier, number> = {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      ULTRA_RARE: 0,
      SECRET_RARE: 0,
      BANGER: 0,
      GRAIL: 0,
    };

    let totalValue = 0;
    let soldBackCount = 0;
    let soldBackValue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;

        const value = Number(item.unitPrice);
        const isSoldBack = item.disposition === "SOLD_BACK";

        items.push({
          orderId: order.id,
          orderItemId: item.id,
          productId: product.id,
          title: product.title,
          imageUrl: product.imageUrl,
          tier: product.tier,
          value,
          packName: order.packName ?? null,
          category: product.category,
          acquiredAt: item.createdAt.toISOString(),
          // Disposition fields
          disposition: item.disposition,
          buybackAmount: item.buybackAmount,
          isSoldBack,
        });

        // Only count non-sold-back items in active portfolio
        if (isSoldBack) {
          soldBackCount++;
          soldBackValue += item.buybackAmount ? item.buybackAmount / 100 : 0;
        } else {
          totalValue += value;
          tierCounts[product.tier] += 1;
        }
      }
    }

    return {
      summary: {
        totalItems: items.length - soldBackCount, // Only kept items
        totalValue,
        tierCounts,
        soldBackCount,
        soldBackValue,
      },
      items,
    };
  }
}

export const collectionService = new CollectionService();
