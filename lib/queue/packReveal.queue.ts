import { Queue } from "bullmq";
import { connection } from "./redis";

const q = new Queue("pack-reveal", { connection, prefix: "bull" });
console.log("WORKER COUNTS", await q.getJobCounts());
console.log(
  "WORKER WAITING IDS",
  (await q.getJobs(["waiting"], 0, 10)).map((j) => j.id),
);

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
