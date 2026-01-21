import "dotenv/config";
import { Queue } from "bullmq";
import { connection } from "@/lib/queue/redis"; // adjust if your path differs

async function inspect(prefix?: string) {
  const q = new Queue("pack-reveal", {
    connection,
    ...(prefix ? { prefix } : {}),
  });
  const counts = await q.getJobCounts();
  const waiting = await q.getJobs(["waiting"], 0, 20);
  return {
    prefix: prefix ?? "(default)",
    counts,
    waitingIds: waiting.map((j) => j.id),
  };
}

(async () => {
  console.log("UPSTASH_REDIS_URL =", process.env.UPSTASH_REDIS_URL);

  console.log(await inspect()); // default prefix
  console.log(await inspect("bull")); // explicit "bull" prefix

  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
