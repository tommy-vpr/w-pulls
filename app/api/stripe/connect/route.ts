// app/api/stripe/connect/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

// POST /api/stripe/connect - Create or get onboarding link
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    let accountId = user.stripeConnectedAccountId;

    // Create a new Connected Account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });

      accountId = account.id;

      // Save the account ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectedAccountId: accountId },
      });
    }

    // Check if already fully onboarded
    const account = await stripe.accounts.retrieve(accountId);

    if (account.details_submitted && account.payouts_enabled) {
      // Already onboarded
      if (!user.stripeConnectOnboardedAt) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeConnectOnboardedAt: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        alreadyOnboarded: true,
        message: "Your payout account is already set up!",
      });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet?connect=complete`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      url: accountLink.url,
      expiresAt: new Date(accountLink.expires_at * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error("Stripe Connect error:", error);

    // Handle Connect not enabled error
    if (
      error.type === "StripeInvalidRequestError" &&
      error.message?.includes("signed up for Connect")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stripe Connect is not enabled for this account. Please contact support.",
          code: "CONNECT_NOT_ENABLED",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create onboarding link",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/stripe/connect - Disconnect/reset connected account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Clear the connected account from user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeConnectedAccountId: null,
        stripeConnectOnboardedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout account disconnected. You can connect a new one.",
    });
  } catch (error: any) {
    console.error("Stripe disconnect error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to disconnect" },
      { status: 500 },
    );
  }
}

// GET /api/stripe/connect - Check onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectedAccountId: true,
        stripeConnectOnboardedAt: true,
      },
    });

    if (!user?.stripeConnectedAccountId) {
      return NextResponse.json({
        success: true,
        status: "not_started",
        hasAccount: false,
        isOnboarded: false,
        payoutsEnabled: false,
      });
    }

    // Get account status from Stripe
    const account = await stripe.accounts.retrieve(
      user.stripeConnectedAccountId,
    );

    const isOnboarded = account.details_submitted && account.payouts_enabled;

    // Update onboarded timestamp if newly completed
    if (isOnboarded && !user.stripeConnectOnboardedAt) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeConnectOnboardedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      status: isOnboarded ? "complete" : "incomplete",
      hasAccount: true,
      isOnboarded,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements?.currently_due ?? [],
    });
  } catch (error: any) {
    console.error("Stripe Connect status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check status" },
      { status: 500 },
    );
  }
}

// // app/api/stripe/connect/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { stripe } from "@/lib/stripe";
// import { auth } from "@/lib/auth";

// // POST /api/stripe/connect - Create or get onboarding link
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: session.user.id },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: "User not found" },
//         { status: 404 },
//       );
//     }

//     let accountId = user.stripeConnectedAccountId;

//     // Create a new Connected Account if none exists
//     if (!accountId) {
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         email: user.email,
//         capabilities: {
//           transfers: { requested: true },
//         },
//         metadata: {
//           userId: user.id,
//         },
//       });

//       accountId = account.id;

//       // Save the account ID
//       await prisma.user.update({
//         where: { id: user.id },
//         data: { stripeConnectedAccountId: accountId },
//       });
//     }

//     // Check if already fully onboarded
//     const account = await stripe.accounts.retrieve(accountId);

//     if (account.details_submitted && account.payouts_enabled) {
//       // Already onboarded
//       if (!user.stripeConnectOnboardedAt) {
//         await prisma.user.update({
//           where: { id: user.id },
//           data: { stripeConnectOnboardedAt: new Date() },
//         });
//       }

//       return NextResponse.json({
//         success: true,
//         alreadyOnboarded: true,
//         message: "Your payout account is already set up!",
//       });
//     }

//     // Create onboarding link
//     const accountLink = await stripe.accountLinks.create({
//       account: accountId,
//       refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?connect=refresh`,
//       return_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet?connect=complete`,
//       type: "account_onboarding",
//     });

//     return NextResponse.json({
//       success: true,
//       url: accountLink.url,
//       expiresAt: new Date(accountLink.expires_at * 1000).toISOString(),
//     });
//   } catch (error: any) {
//     console.error("Stripe Connect error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Failed to create onboarding link",
//       },
//       { status: 500 },
//     );
//   }
// }

// // GET /api/stripe/connect - Check onboarding status
// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: session.user.id },
//       select: {
//         stripeConnectedAccountId: true,
//         stripeConnectOnboardedAt: true,
//       },
//     });

//     if (!user?.stripeConnectedAccountId) {
//       return NextResponse.json({
//         success: true,
//         status: "not_started",
//         hasAccount: false,
//         isOnboarded: false,
//         payoutsEnabled: false,
//       });
//     }

//     // Get account status from Stripe
//     const account = await stripe.accounts.retrieve(
//       user.stripeConnectedAccountId,
//     );

//     const isOnboarded = account.details_submitted && account.payouts_enabled;

//     // Update onboarded timestamp if newly completed
//     if (isOnboarded && !user.stripeConnectOnboardedAt) {
//       await prisma.user.update({
//         where: { id: session.user.id },
//         data: { stripeConnectOnboardedAt: new Date() },
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       status: isOnboarded ? "complete" : "incomplete",
//       hasAccount: true,
//       isOnboarded,
//       payoutsEnabled: account.payouts_enabled,
//       detailsSubmitted: account.details_submitted,
//       requirements: account.requirements?.currently_due ?? [],
//     });
//   } catch (error: any) {
//     console.error("Stripe Connect status error:", error);
//     return NextResponse.json(
//       { success: false, error: error.message || "Failed to check status" },
//       { status: 500 },
//     );
//   }
// }
