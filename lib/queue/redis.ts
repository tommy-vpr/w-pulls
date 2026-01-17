import { ConnectionOptions } from "bullmq";

export const connection: ConnectionOptions = {
  url: process.env.UPSTASH_REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
