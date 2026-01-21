import { ConnectionOptions } from "bullmq";

const url = process.env.UPSTASH_REDIS_URL;
if (!url) throw new Error("Missing UPSTASH_REDIS_URL");

// Parse the Upstash URL (format: rediss://:password@host:port)
const parsed = new URL(url);

export const connection: ConnectionOptions = {
  host: parsed.hostname,
  port: parseInt(parsed.port, 10) || 6379,
  password: parsed.password,
  tls: {}, // Required for Upstash (rediss://)
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
