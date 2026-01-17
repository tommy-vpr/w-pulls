import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";
import { getPackById } from "@/lib/packs/config";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";

console.log("🟢 Pack reveal worker booting…");

const worker = new Worker(
  "pack-reveal",
  async (job) => {
    console.log("▶️ Processing job", job.id);

    const { orderId, packId, stripeSessionId } = job.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    // Idempotency
    if (!order) return;
    if (order.status === "COMPLETED") return;
    if (order.status === "FAILED") return;
    if (order.items.length > 0) return;

    const pack = getPackById(packId);
    if (!pack) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
      return;
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, inventory: { gt: 0 } },
    });

    if (products.length === 0) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
      return;
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
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
      return;
    }

    try {
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

        await tx.product.update({
          where: { id: product.id },
          data: { inventory: { decrement: 1 } },
        });

        await tx.orderItem.create({
          data: {
            orderId,
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
            selectedTier: rolledTier,
            stripeSessionId,
          },
        });
      });
    } catch (err) {
      // 👇 THIS is the entire improvement
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      throw err; // keep BullMQ retry + observability
    }
  },
  { connection }
);

console.log("🟢 Pack reveal worker ready (waiting for jobs)");

worker.on("completed", (job) => {
  console.log("✅ Job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.error("❌ Job failed", job?.id, err.message);
});
