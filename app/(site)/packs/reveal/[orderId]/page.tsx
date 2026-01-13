import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RevealAnimation } from "@/components/reveal/RevealAnimation";
import { serializeProduct } from "@/types/product";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { getPackById } from "@/lib/packs/config";

interface RevealPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function RevealPage({
  params,
  searchParams,
}: RevealPageProps) {
  const { orderId } = await params;

  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) {
    notFound();
  }

  if (order.status === "FAILED") {
    redirect("/packs?error=payment_failed");
  }

  // If payment not completed yet, show loading
  if (order.status === "PENDING") {
    return (
      <div className="min-h-screen bg-accent-foreground flex flex-col items-center justify-center p-6 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg text-muted-foreground">
          Processing your payment...
        </p>
        <meta httpEquiv="refresh" content="2" />
      </div>
    );
  }

  // Payment completed but product not assigned - do the roll now
  if (!order.product || !order.selectedTier) {
    const pack = getPackById(order.packId);

    if (!pack) {
      redirect("/packs?error=invalid_pack");
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, inventory: { gt: 0 } },
    });

    if (products.length === 0) {
      redirect("/packs?error=no_inventory");
    }

    const rolledTier = rollTier({
      odds: pack.odds,
      minTier: pack.minTier,
      allowedTiers: pack.allowedTiers,
    });

    const selectedProduct = pickProductWithBump({
      products,
      rolledTier,
    });

    if (!selectedProduct) {
      redirect("/packs?error=no_inventory");
    }

    // Update order and decrement inventory
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          productId: selectedProduct.id,
          selectedTier: rolledTier,
        },
      }),
      prisma.product.update({
        where: { id: selectedProduct.id },
        data: { inventory: { decrement: 1 } },
      }),
    ]);

    // Refetch with product
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });
  }

  if (!order?.product || !order?.selectedTier) {
    redirect("/packs?error=assignment_failed");
  }

  return (
    <div className="h-screen w-screen bg-accent-foreground flex items-center justify-center">
      <RevealAnimation
        product={serializeProduct(order.product)}
        tier={order.selectedTier}
        packName={order.packName}
      />
    </div>
  );
}
