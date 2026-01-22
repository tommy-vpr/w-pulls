import "dotenv/config";

import "./packReveal.worker";
import "./orderAbandon.worker";
import "./productFulfillment.worker";
import "./withdrawal.worker";

console.log("🧵 All workers booted");
