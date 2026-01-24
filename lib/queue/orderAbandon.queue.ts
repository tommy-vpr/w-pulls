// lib/queue/orderAbandon.queue.ts
import { Queue } from "bullmq";
import { connection } from "./redis";

export const orderAbandonQueue = new Queue("order-abandon", {
  connection,
});
