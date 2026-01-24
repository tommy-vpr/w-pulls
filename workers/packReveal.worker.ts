import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";
import { getPackById } from "@/lib/packs/config";
import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
import { getProductImageUrl } from "@/lib/utils/productImage";
import { auditService } from "@/lib/services/audit.service";

console.log("🟢 Pack reveal worker booting…");

const worker = new Worker(
  "pack-reveal",
  async (job) => {
    console.log("▶️ Processing job", job.id);

    const { orderId, packId } = job.data;

    /**
     * 1️⃣ Load order + idempotency guard
     */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;
    if (order.status !== "PROCESSING") return;
    if (order.items.length > 0) return;

    /**
     * 2️⃣ Load pack + inventory pool
     */
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

    /**
     * 3️⃣ Roll tier + select product
     */
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

    const oldInventory = selectedProduct.inventory;
    let revealedProduct;

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
     * 4️⃣ TRANSACTION (DB mutations only)
     */
    try {
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
            // revealedAt: new Date(), ONLY CALLED IN API/PACKS/REVEAL
          },
        });

        return product;
      });
    } catch (err) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });

      throw err;
    }

    /**
     * 5️⃣ AUDITS (outside transaction)
     */
    await auditService.logOrderStatusChange(
      orderId,
      "PROCESSING",
      "COMPLETED",
      {
        selectedTier: rolledTier,
        productId: revealedProduct.id,
        source: "pack-reveal-worker",
      },
    );

    await auditService.logInventoryChange(
      revealedProduct.id,
      oldInventory,
      oldInventory - 1,
      `Pack reveal: ${order.packName ?? "Unknown Pack"}`,
      { performedBy: "system" },
    );

    await auditService.logProductRevealed(orderId, {
      performedBy: "system",
    });

    /**
     * 6️⃣ Confirmation email (last)
     */
    if (!order.customerEmail) {
      console.warn("Missing customer email for order", orderId);
      return;
    }

    console.log("📸 revealedProduct:", {
      id: revealedProduct.id,
      title: revealedProduct.title,
      imageUrl: revealedProduct.imageUrl,
    });
    console.log(
      "📸 getProductImageUrl result:",
      getProductImageUrl(revealedProduct.imageUrl),
    );

    await sendOrderConfirmationEmail({
      to: order.customerEmail!,
      customerName: order.customerName!,
      orderNumber: order.orderNumber.toString(),
      orderDate: new Date().toLocaleDateString("en-US"),
      orderType: order.type,
      packPrice: order.type === "PACK" ? order.amount : undefined,
      items: [
        {
          name: revealedProduct.title,
          quantity: 1,
          price: order.amount, // ✅ PACK PRICE
          image: getProductImageUrl(revealedProduct.imageUrl),
        },
      ],
      subtotal: order.subtotal ?? 0,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      total: order.amount,

      // SHIPPING ADDRESS from DB
      shippingAddress,
    });
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

// import { Worker } from "bullmq";
// import prisma from "@/lib/prisma";
// import { connection } from "@/lib/queue/redis";
// import { getPackById } from "@/lib/packs/config";
// import { rollTier, pickProductWithBump } from "@/lib/packs/ev";
// import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";
// import { getProductImageUrl } from "@/lib/utils/productImage";

// console.log("🟢 Pack reveal worker booting…");

// const worker = new Worker(
//   "pack-reveal",
//   async (job) => {
//     console.log("▶️ Processing job", job.id);

//     const { orderId, packId } = job.data;

//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: { items: true },
//     });

//     // Idempotency
//     if (!order) return;
//     if (order.status !== "PROCESSING") return;
//     if (order.items.length > 0) return;

//     const pack = getPackById(packId);
//     if (!pack) {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: "FAILED" },
//       });
//       return;
//     }

//     const products = await prisma.product.findMany({
//       where: { isActive: true, inventory: { gt: 0 } },
//     });

//     if (products.length === 0) {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: "FAILED" },
//       });
//       return;
//     }

//     const rolledTier = rollTier({
//       odds: pack.odds,
//       minTier: pack.minTier,
//       allowedTiers: pack.allowedTiers,
//     });

//     const selectedProduct = pickProductWithBump({
//       products,
//       rolledTier,
//     });

//     if (!selectedProduct) {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: "FAILED" },
//       });
//       return;
//     }

//     let revealedProduct = null;

//     try {
//       // Transaction for DB operations only
//       revealedProduct = await prisma.$transaction(async (tx) => {
//         const product = await tx.product.findFirst({
//           where: {
//             id: selectedProduct.id,
//             inventory: { gt: 0 },
//             isActive: true,
//           },
//         });

//         if (!product) {
//           throw new Error("Inventory exhausted");
//         }

//         await tx.product.update({
//           where: { id: product.id },
//           data: { inventory: { decrement: 1 } },
//         });

//         await tx.orderItem.create({
//           data: {
//             orderId,
//             productId: product.id,
//             quantity: 1,
//             unitPrice: product.price,
//           },
//         });

//         await tx.order.update({
//           where: { id: orderId },
//           data: {
//             status: "COMPLETED",
//             selectedTier: rolledTier,
//           },
//         });

//         return product;
//       });

//       // ✅ Send confirmation email AFTER transaction completes
//       if (revealedProduct) {
//         await sendOrderConfirmationEmail({
//           to: order.customerEmail!,
//           customerName: order.customerName!,
//           orderNumber: order.orderNumber.toString(),
//           orderDate: new Date().toLocaleDateString("en-US"),
//           items: [
//             {
//               name: revealedProduct.title,
//               quantity: 1,
//               price: Number(revealedProduct.price) * 100, // Convert to cents
//               image: getProductImageUrl(revealedProduct.imageUrl),
//             },
//           ],
//           subtotal: order.subtotal ?? 0,
//           tax: order.tax ?? 0,
//           shipping: order.shipping ?? 0,
//           total: order.amount,
//         });
//       }
//     } catch (err) {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { status: "FAILED" },
//       });

//       throw err; // keep BullMQ retry + observability
//     }
//   },
//   { connection },
// );

// console.log("🟢 Pack reveal worker ready (waiting for jobs)");

// worker.on("completed", (job) => {
//   console.log("✅ Job completed", job.id);
// });

// worker.on("failed", (job, err) => {
//   console.error("❌ Job failed", job?.id, err.message);
// });

// worker.on("error", (err) => {
//   console.error("❌ Worker error", err);
// });
