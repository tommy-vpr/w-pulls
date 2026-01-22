import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";
import { auditService } from "@/lib/services/audit.service";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import { getProductImageUrl } from "@/lib/utils/productImage";

console.log("🎴 Product fulfillment worker booted");

new Worker(
  "product-fulfillment",
  async (job) => {
    const { orderId } = job.data;

    /**
     * 1️⃣ Load order + idempotency guards
     */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) return;
    if (order.type !== "PRODUCT") return;
    if (order.status !== "PROCESSING") return;
    if (order.items.length === 0) {
      throw new Error("PRODUCT order has no items");
    }

    /**
     * 2️⃣ Capture inventory snapshot for audits
     */
    const inventoryBefore = new Map(
      order.items.map((i) => [i.productId, i.product.inventory]),
    );

    /**
     * 3️⃣ TRANSACTION — inventory + order finalize
     */
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
              `Insufficient inventory for product ${item.productId}`,
            );
          }

          await tx.product.update({
            where: { id: product.id },
            data: {
              inventory: { decrement: item.quantity },
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" },
        });
      });
    } catch (err) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      throw err;
    }

    /**
     * 4️⃣ AUDITS (outside transaction)
     */
    await auditService.logOrderStatusChange(
      orderId,
      "PROCESSING",
      "COMPLETED",
      { source: "product-fulfillment-worker" },
    );

    for (const item of order.items) {
      const before = inventoryBefore.get(item.productId)!;
      const after = before - item.quantity;

      await auditService.logInventoryChange(
        item.productId,
        before,
        after,
        `Product order ${order.orderNumber}`,
        { performedBy: "system" },
      );
    }

    const shippingAddress = order.shippingLine1
      ? {
          line1: order.shippingLine1,
          line2: order.shippingLine2 ?? undefined,
          city: order.shippingCity ?? "",
          state: order.shippingState ?? "",
          postalCode: order.shippingPostal ?? "",
          country: order.shippingCountry ?? "",
        }
      : undefined;

    /**
     * 5️⃣ Confirmation email
     */
    await sendOrderConfirmationEmail({
      to: order.customerEmail!,
      customerName: order.customerName!,
      orderNumber: order.orderNumber.toString(),
      orderDate: new Date().toLocaleDateString("en-US"),
      // ✅ REQUIRED
      orderType: "PRODUCT",

      items: order.items.map((i) => ({
        name: i.product.title,
        quantity: i.quantity,
        price: Number(i.unitPrice) * 100,
        image: getProductImageUrl(i.product.imageUrl),
      })),
      subtotal: order.subtotal ?? 0,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      total: order.amount,
      shippingAddress,
    });
  },
  { connection },
);

console.log("🎴 Product fulfillment ready (waiting for jobs)");

// import { Worker } from "bullmq";
// import prisma from "@/lib/prisma";
// import { connection } from "@/lib/queue/redis";

// console.log("🟢 Product fulfillment worker booted");

// new Worker(
//   "product-fulfillment",
//   async (job) => {
//     const { orderId } = job.data;

//     // Load order with items
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         items: true,
//       },
//     });

//     // Idempotency guards
//     if (!order) return;
//     if (order.status === "COMPLETED") return;
//     if (order.status === "FAILED") return;
//     if (order.type !== "PRODUCT") return;

//     // PRODUCT orders MUST already have items
//     if (order.items.length === 0) {
//       throw new Error("PRODUCT order has no items");
//     }

//     try {
//       await prisma.$transaction(async (tx) => {
//         for (const item of order.items) {
//           const product = await tx.product.findFirst({
//             where: {
//               id: item.productId,
//               isActive: true,
//               inventory: { gte: item.quantity },
//             },
//           });

//           if (!product) {
//             throw new Error(
//               `Insufficient inventory for product ${item.productId}`
//             );
//           }

//           // Decrement inventory
//           await tx.product.update({
//             where: { id: product.id },
//             data: {
//               inventory: { decrement: item.quantity },
//             },
//           });
//         }

//         // Finalize order
//         await tx.order.update({
//           where: { id: orderId },
//           data: {
//             status: "COMPLETED",
//           },
//         });
//       });
//     } catch (err) {
//       // Terminal failure — do NOT retry forever
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: "FAILED" },
//       });

//       throw err; // BullMQ handles retries / dead-letter
//     }
//   },
//   { connection }
// );
