// lib/workers/orderAbandon.worker.ts for BOTH TYPE
import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { connection } from "@/lib/queue/redis";

console.log("💲 Order Abandon worker booting…");

new Worker(
  "order-abandon",
  async (job) => {
    const { orderId } = job.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;
    if (order.status !== "PENDING") return;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "ABANDONED" },
    });

    console.log(`🗑️ Abandoned ${order.type} order ${orderId}`);
  },
  { connection },
);

console.log("💲 Order Abandon worker ready (waiting for jobs)");

// // lib/workers/orderAbandon.worker.ts
// import { Worker } from "bullmq";
// import prisma from "@/lib/prisma";
// import { connection } from "@/lib/queue/redis";

// console.log("💲 Order Abandon worker booting…");

// new Worker(
//   "order-abandon",
//   async (job) => {
//     const { orderId } = job.data;

//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//     });

//     // 🔒 Safety guards
//     if (!order) return;
//     if (order.type !== "PRODUCT") return;
//     if (order.status !== "PENDING") return;

//     await prisma.order.update({
//       where: { id: orderId },
//       data: { status: "ABANDONED" },
//     });

//     console.log(`🗑️ Abandoned order ${orderId}`);
//   },
//   { connection },
// );

// console.log("💲 Order Abandon worker ready (waiting for jobs)");
