import "dotenv/config";

import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";
import { getPackById } from "@/lib/packs/config";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import { getProductImageUrl } from "@/lib/utils/productImage";

console.log("🟢 Pack reveal worker booting…");

const worker = new Worker(
  "pack-reveal",
  async (job) => {
    console.log("▶️ Processing job", job.id);

    const { orderId, packId } = job.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    // Idempotency
    if (!order) return;
    if (order.status !== "PROCESSING") return;
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

    let revealedProduct = null;

    try {
      // Transaction for DB operations only
      revealedProduct = await prisma.$transaction(async (tx) => {
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
          },
        });

        return product;
      });

      // ✅ Send confirmation email AFTER transaction completes
      if (revealedProduct) {
        await sendOrderConfirmationEmail({
          to: order.customerEmail!,
          customerName: order.customerName!,
          orderNumber: order.orderNumber.toString(),
          orderDate: new Date().toLocaleDateString("en-US"),
          items: [
            {
              name: revealedProduct.title,
              quantity: 1,
              price: Number(revealedProduct.price) * 100, // Convert to cents
              image: getProductImageUrl(revealedProduct.imageUrl),
            },
          ],
          subtotal: order.subtotal ?? 0,
          tax: order.tax ?? 0,
          shipping: order.shipping ?? 0,
          total: order.amount,
        });
      }
    } catch (err) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      throw err; // keep BullMQ retry + observability
    }
  },
  { connection },
);

console.log("🟢 Pack reveal worker ready (waiting for jobs)");

worker.on("completed", (job) => {
  console.log("✅ Job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.error("❌ Job failed", job?.id, err.message);
});

worker.on("error", (err) => {
  console.error("❌ Worker error", err);
});
