// lib/queue/withdrawal.queue.ts

import { Queue } from "bullmq";
import { connection } from "./redis";

export type WithdrawalJob = {
  withdrawalId: string;
};

export const withdrawalQueue = new Queue<WithdrawalJob>("withdrawal-payout", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 50,
  },
});
