import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RevealAnimation } from "@/components/reveal/RevealAnimation";
import { serializeProduct } from "@/types/product";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { getPackById } from "@/lib/packs/config";
import { PackRevealAnimation } from "@/components/reveal/PackRevealAnimation";

interface RevealPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function RevealPage({ params }: RevealPageProps) {
  const { orderId } = await params;

  // 1️⃣ Load order with items + product
  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // 2️⃣ Failure guard
  if (order.status === "FAILED") {
    redirect("/packs?error=payment_failed");
  }

  // 3️⃣ Pending payment state
  if (order.status === "PENDING") {
    return (
      <div className="min-h-screen bg-accent-foreground flex flex-col items-center justify-center p-6 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-lg text-muted-foreground">
          Processing your payment...
        </p>
        <meta httpEquiv="refresh" content="2" />
      </div>
    );
  }

  // 4️⃣ HARD LOCK: reveal only if NOT completed
  if (order.status !== "COMPLETED") {
    if (!order.packId) {
      redirect("/packs?error=invalid_pack");
    }

    const pack = getPackById(order.packId);

    if (!pack) {
      redirect("/packs?error=invalid_pack");
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        inventory: { gt: 0 },
      },
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

    // 5️⃣ TRANSACTION: inventory + reveal + finalize order
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: selectedProduct.id,
          inventory: { gt: 0 },
          isActive: true,
        },
      });

      if (!product) {
        throw new Error("Inventory exhausted");
      }

      // decrement inventory
      await tx.product.update({
        where: { id: product.id },
        data: { inventory: { decrement: 1 } },
      });

      // create order item (reveal)
      await tx.orderItem.create({
        data: {
          orderId,
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
        },
      });

      // finalize order
      await tx.order.update({
        where: { id: orderId },
        data: {
          selectedTier: rolledTier,
          status: "COMPLETED",
        },
      });
    });

    // 6️⃣ Refetch finalized order
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // 7️⃣ Final safety checks
  if (!order || order.items.length === 0 || !order.selectedTier) {
    redirect("/packs?error=assignment_failed");
  }

  const item = order.items[0];

  if (!item.product) {
    redirect("/packs?error=assignment_failed");
  }

  // 8️⃣ Render reveal
  return (
    <div className="h-screen w-screen bg-accent-foreground flex items-center justify-center">
      {/* <RevealAnimation
        product={serializeProduct(item.product)}
        tier={order.selectedTier}
        packName={order.packName!}
      /> */}
      <PackRevealAnimation
        product={serializeProduct(item.product)}
        tier={order.selectedTier}
        packName={order.packName!}
        orderId={order.id}
        packTopImage={`/images/pack-top.png`}
        packBottomImage={`/images/pack-bottom.png`}
      />
    </div>
  );
}
