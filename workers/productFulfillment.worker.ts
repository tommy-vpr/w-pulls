import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";

console.log("🟢 Product fulfillment worker booted");

new Worker(
  "product-fulfillment",
  async (job) => {
    const { orderId } = job.data;

    // Load order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    // Idempotency guards
    if (!order) return;
    if (order.status === "COMPLETED") return;
    if (order.status === "FAILED") return;
    if (order.type !== "PRODUCT") return;

    // PRODUCT orders MUST already have items
    if (order.items.length === 0) {
      throw new Error("PRODUCT order has no items");
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findFirst({
            where: {
              id: item.productId,
              isActive: true,
              inventory: { gte: item.quantity },
            },
          });

          if (!product) {
            throw new Error(
              `Insufficient inventory for product ${item.productId}`
            );
          }

          // Decrement inventory
          await tx.product.update({
            where: { id: product.id },
            data: {
              inventory: { decrement: item.quantity },
            },
          });
        }

        // Finalize order
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "COMPLETED",
          },
        });
      });
    } catch (err) {
      // Terminal failure — do NOT retry forever
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      throw err; // BullMQ handles retries / dead-letter
    }
  },
  { connection }
);
