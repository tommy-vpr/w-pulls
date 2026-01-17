import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { productIds } = await req.json();

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      price: true,
      imageUrl: true,
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: p.price.toString(),
    })),
  });
}
