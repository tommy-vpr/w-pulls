// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { getPackById } from "@/lib/packs/config";
import { auditService } from "@/lib/services/audit.service";
import { auth } from "@/lib/auth";
import { orderAbandonQueue } from "@/lib/queue/orderAbandon.queue";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          redirect: "/auth?callbackUrl=/packs",
        },
        { status: 401 },
      );
    }

    const { packId } = await request.json();
    const pack = getPackById(packId);

    if (!pack) {
      return NextResponse.json(
        { success: false, error: "Invalid pack" },
        { status: 400 },
      );
    }

    // Create PENDING order with user info from session
    const order = await prisma.order.create({
      data: {
        type: "PACK", // Add this!
        userId: session.user.id,
        packId: pack.id,
        packName: pack.name,
        amount: pack.price,
        status: "PENDING",
        customerName: session.user.name ?? null,
        customerEmail: session.user.email ?? null,
      },
    });

    // Add abandon worker
    await orderAbandonQueue.add(
      "abandon-check",
      { orderId: order.id },
      {
        delay: 30 * 60 * 1000,
        jobId: `abandon_${order.id}`, // ✅ no colon
      },
    );

    await auditService.logOrderCreated(order, {
      performedBy: session.user.id,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      // customer_email: session.user.email ?? undefined,

      // Enable automatic tax calculation
      automatic_tax: { enabled: true },

      // Collect shipping address (required for tax calculation on physical goods)
      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pack.price,
            tax_behavior: "exclusive",
            product_data: {
              name: pack.name,
              description: pack.description,
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/packs/reveal/${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/packs?canceled=true`,
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        packId: pack.id,
      },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 },
    );
  }
}
