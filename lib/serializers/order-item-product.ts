import { Prisma } from "@prisma/client";

export interface SerializedOrderItemProduct {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  tier: string;
  category: string;
}

export function serializeOrderItemProduct(product: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: Prisma.Decimal;
  tier: string;
  category: string;
}): SerializedOrderItemProduct {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    imageUrl: product.imageUrl,
    price: product.price.toString(),
    tier: product.tier,
    category: product.category,
  };
}
