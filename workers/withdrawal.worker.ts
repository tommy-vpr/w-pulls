// workers/withdrawal.worker.ts

import "dotenv/config";

import { Worker } from "bullmq";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { connection } from "@/lib/queue/redis";
import { walletService } from "@/lib/services/wallet.service";
import { WalletTransactionReason, WithdrawalStatus } from "@prisma/client";
import { getWithdrawalErrorMessage } from "@/lib/utils/withdrawal-errors";

console.log("⬅️  Withdrawal payout worker booting…");

const worker = new Worker(
  "withdrawal-payout",
  async (job) => {
    console.log("▶️ Processing withdrawal job", job.id);

    const { withdrawalId } = job.data;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      console.error("❌ Withdrawal not found:", withdrawalId);
      return;
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      console.log(`⏭️ Withdrawal ${withdrawalId} already ${withdrawal.status}`);
      return;
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: WithdrawalStatus.PROCESSING },
    });

    try {
      if (!withdrawal.user.stripeConnectedAccountId) {
        throw new Error("User has no connected payout account");
      }

      const account = await stripe.accounts.retrieve(
        withdrawal.user.stripeConnectedAccountId,
      );

      if (!account.payouts_enabled) {
        throw new Error(
          "Payout account is not enabled. User needs to complete onboarding.",
        );
      }

      const transfer = await stripe.transfers.create({
        amount: withdrawal.amount,
        currency: "usd",
        destination: withdrawal.user.stripeConnectedAccountId,
        metadata: {
          withdrawalId: withdrawal.id,
          userId: withdrawal.userId,
        },
        description: `W-Pull withdrawal ${withdrawal.id}`,
      });

      console.log(`✅ Transfer created: ${transfer.id}`);

      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.PAID,
          stripeTransferId: transfer.id,
          processedAt: new Date(),
        },
      });

      console.log(`✅ Withdrawal ${withdrawalId} completed`);
    } catch (err: any) {
      const rawError = err.message || "Payout failed";
      const userFriendlyError = getWithdrawalErrorMessage(rawError);

      console.error(`❌ Withdrawal ${withdrawalId} failed:`, rawError);

      await prisma.$transaction(async (tx) => {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: WithdrawalStatus.FAILED,
            failedAt: new Date(),
            failureReason: userFriendlyError, // User-friendly message
          },
        });

        await walletService.credit(
          {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            reason: WalletTransactionReason.WITHDRAWAL_FAILED,
            notes: `Refund for failed withdrawal ${withdrawalId}: ${rawError}`, // Raw error for internal logs
          },
          tx,
        );
      });
    }
  },
  { connection },
);

console.log("⬅️  Withdrawal payout worker ready (waiting for jobs)");

worker.on("completed", (job) => {
  console.log("✅ Withdrawal job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.error("❌ Withdrawal job failed", job?.id, err.message);
});

worker.on("error", (err) => {
  console.error("❌ Worker error", err);
});

// // workers/withdrawal.worker.ts

// import "dotenv/config";

// import { Worker } from "bullmq";
// import prisma from "@/lib/prisma";
// import { stripe } from "@/lib/stripe";
// import { connection } from "@/lib/queue/redis";
// import { walletService } from "@/lib/services/wallet.service";
// import { WalletTransactionReason, WithdrawalStatus } from "@prisma/client";

// console.log("⬅️  Withdrawal payout worker booting…");

// const worker = new Worker(
//   "withdrawal-payout",
//   async (job) => {
//     console.log("▶️ Processing withdrawal job", job.id);

//     const { withdrawalId } = job.data;

//     // Fetch withdrawal with user
//     const withdrawal = await prisma.withdrawal.findUnique({
//       where: { id: withdrawalId },
//       include: { user: true },
//     });

//     if (!withdrawal) {
//       console.error("❌ Withdrawal not found:", withdrawalId);
//       return;
//     }

//     // Idempotency: skip if not pending
//     if (withdrawal.status !== WithdrawalStatus.PENDING) {
//       console.log(`⏭️ Withdrawal ${withdrawalId} already ${withdrawal.status}`);
//       return;
//     }

//     // Mark as processing
//     await prisma.withdrawal.update({
//       where: { id: withdrawalId },
//       data: { status: WithdrawalStatus.PROCESSING },
//     });

//     try {
//       // Verify user has Stripe Connect account
//       if (!withdrawal.user.stripeConnectedAccountId) {
//         throw new Error("User has no connected payout account");
//       }

//       // Verify account is enabled for payouts
//       const account = await stripe.accounts.retrieve(
//         withdrawal.user.stripeConnectedAccountId,
//       );

//       if (!account.payouts_enabled) {
//         throw new Error(
//           "Payout account is not enabled. User needs to complete onboarding.",
//         );
//       }

//       // Create transfer to connected account
//       const transfer = await stripe.transfers.create({
//         amount: withdrawal.amount,
//         currency: "usd",
//         destination: withdrawal.user.stripeConnectedAccountId,
//         metadata: {
//           withdrawalId: withdrawal.id,
//           userId: withdrawal.userId,
//         },
//         description: `W-Pull withdrawal ${withdrawal.id}`,
//       });

//       console.log(`✅ Transfer created: ${transfer.id}`);

//       // Mark withdrawal as paid
//       await prisma.withdrawal.update({
//         where: { id: withdrawalId },
//         data: {
//           status: WithdrawalStatus.PAID,
//           stripeTransferId: transfer.id,
//           processedAt: new Date(),
//         },
//       });

//       console.log(`✅ Withdrawal ${withdrawalId} completed`);
//     } catch (err: any) {
//       console.error(`❌ Withdrawal ${withdrawalId} failed:`, err.message);

//       // Mark as failed and refund balance
//       await prisma.$transaction(async (tx) => {
//         // Update withdrawal status
//         await tx.withdrawal.update({
//           where: { id: withdrawalId },
//           data: {
//             status: WithdrawalStatus.FAILED,
//             failedAt: new Date(),
//             failureReason: err.message || "Payout failed",
//           },
//         });

//         // Refund the amount back to wallet
//         await walletService.credit(
//           {
//             userId: withdrawal.userId,
//             amount: withdrawal.amount,
//             reason: WalletTransactionReason.WITHDRAWAL_FAILED,
//             notes: `Refund for failed withdrawal ${withdrawalId}: ${err.message}`,
//           },
//           tx,
//         );
//       });

//       // Re-throw to trigger retry (if configured)
//       // Or comment this out to just mark as failed without retrying
//       // throw err;
//     }
//   },
//   { connection },
// );

// console.log("⬅️  Withdrawal payout worker ready (waiting for jobs)");

// worker.on("completed", (job) => {
//   console.log("✅ Withdrawal job completed", job.id);
// });

// worker.on("failed", (job, err) => {
//   console.error("❌ Withdrawal job failed", job?.id, err.message);
// });

// worker.on("error", (err) => {
//   console.error("❌ Worker error", err);
// });
