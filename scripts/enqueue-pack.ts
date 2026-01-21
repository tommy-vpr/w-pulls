import "dotenv/config";
import { packRevealQueue } from "@/lib/queue/packReveal.queue";

async function main() {
  const orderId = process.argv[2];
  const packId = process.argv[3] ?? "starter";

  if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error("Missing UPSTASH_REDIS_URL");
  }
  if (!orderId) {
    throw new Error("Usage: tsx scripts/enqueue-pack.ts <orderId> [packId]");
  }

  console.log("Redis:", process.env.UPSTASH_REDIS_URL);

  const job = await packRevealQueue.add(
    "assign-reveal",
    { orderId, packId, stripeSessionId: "test_session" },
    { jobId: `test:${orderId}:${Date.now()}` },
  );

  console.log("Enqueued job:", job.id);

  const counts = await packRevealQueue.getJobCounts();
  console.log("Counts:", counts);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
