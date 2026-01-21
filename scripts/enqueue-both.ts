import "dotenv/config";
import { Queue } from "bullmq";
import { connection } from "@/lib/queue/redis";

const orderId = process.argv[2];
const packId = process.argv[3] ?? "starter";

if (!orderId) {
  console.error("Usage: npx tsx scripts/enqueue-both.ts <orderId> [packId]");
  process.exit(1);
}

async function add(prefix?: string) {
  const q = new Queue("pack-reveal", {
    connection,
    ...(prefix ? { prefix } : {}),
  });
  const job = await q.add(
    "assign-reveal",
    { orderId, packId, stripeSessionId: "manual_test" },
    { jobId: `${prefix ?? "default"}:${orderId}:${Date.now()}` },
  );
  console.log("Enqueued", { prefix: prefix ?? "(default)", jobId: job.id });
  console.log("Counts", {
    prefix: prefix ?? "(default)",
    ...(await q.getJobCounts()),
  });
}

(async () => {
  console.log("UPSTASH_REDIS_URL =", process.env.UPSTASH_REDIS_URL);
  await add(); // default
  await add("bull"); // bull
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
