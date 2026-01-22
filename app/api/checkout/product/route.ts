// api/checkout/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { orderAbandonQueue } from "@/lib/queue/orderAbandon.queue";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty cart" },
        { status: 400 },
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        isActive: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "Invalid products in cart" },
        { status: 400 },
      );
    }

    const amount = products.reduce((sum, product) => {
      const item = items.find((i) => i.productId === product.id)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        type: "PRODUCT",
        userId: session.user.id,
        amount: Math.round(amount * 100),
        subtotal: Math.round(amount * 100),
        status: "PENDING",
        customerName: session.user.name ?? null,
        customerEmail: session.user.email ?? null,
        items: {
          create: products.map((product) => {
            const item = items.find((i) => i.productId === product.id)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              unitPrice: product.price,
            };
          }),
        },
      },
    });

    // After prisma.order.create(...)
    await orderAbandonQueue.add(
      "abandon-check",
      { orderId: order.id },
      {
        delay: 1 * 60 * 1000,
        jobId: `abandon_${order.id}`, // ✅ no colon
      },
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",

      // Enable automatic tax calculation
      automatic_tax: { enabled: true },

      // Collect shipping address
      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      // Shipping options
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 999, // $9.99
              currency: "usd",
            },
            display_name: "Express Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 3 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1999, // $19.99
              currency: "usd",
            },
            display_name: "Overnight Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 1 },
            },
          },
        },
      ],

      line_items: products.map((product) => {
        const item = items.find((i) => i.productId === product.id)!;

        const imageUrl =
          product.imageUrl && product.imageUrl.startsWith("http")
            ? product.imageUrl
            : undefined;

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(product.price) * 100),
            tax_behavior: "exclusive",
            product_data: {
              name: product.title,
              ...(imageUrl && { images: [imageUrl] }),
              tax_code: "txcd_99999999",
            },
          },
        };
      }),

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=true`,

      metadata: {
        orderId: order.id,
        orderType: "PRODUCT",
        userId: session.user.id,
      },
    });

    // Store Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (err) {
    console.error("Product checkout error:", err);
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 },
    );
  }
}
