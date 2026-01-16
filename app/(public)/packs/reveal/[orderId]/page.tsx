import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RevealAnimation } from "@/components/reveal/RevealAnimation";
import { serializeProduct } from "@/types/product";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { getPackById } from "@/lib/packs/config";
import { PackRevealAnimation } from "@/components/reveal/PackRevealAnimation";
import { PackSlashAnimation } from "@/components/reveal/PackSlashAnimation";

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

  if (order.status !== "COMPLETED") {
    return (
      <div className="min-h-screen bg-accent-foreground flex flex-col items-center justify-center p-6 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        <p className="text-lg text-muted-foreground">Opening your pack...</p>
        <meta httpEquiv="refresh" content="2" />
      </div>
    );
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
      {/* <PackRevealAnimation
        product={serializeProduct(item.product)}
        tier={order.selectedTier}
        packName={order.packName!}
        orderId={order.id}
        packTopImage={`/images/pack-top.png`}
        packBottomImage={`/images/pack-bottom.png`}
      /> */}
      <PackSlashAnimation
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
