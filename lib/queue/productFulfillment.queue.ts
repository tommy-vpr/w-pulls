import { Queue } from "bullmq";
import { connection } from "./redis";

export const productFulfillmentQueue = new Queue("product-fulfillment", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
