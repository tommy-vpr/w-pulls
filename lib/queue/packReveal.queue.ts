import { Queue } from "bullmq";
import { connection } from "./redis";

export type PackRevealJob = {
  orderId: string;
  packId: string;
  stripeSessionId?: string;
};

export const packRevealQueue = new Queue<PackRevealJob>("pack-reveal", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: 50,
  },
});
