// api/checkout/product
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty cart" },
        { status: 400 }
      );
    }

    // Reload products from DB (authoritative)
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        isActive: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "Invalid products in cart" },
        { status: 400 }
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
        status: "PENDING",
        customerName: session.user.name ?? null,
        customerEmail: session.user.email ?? null,
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      //   customer_email: session.user.email ?? undefined,

      // Add these two lines
      automatic_tax: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      line_items: products.map((product) => {
        const item = items.find((i) => i.productId === product.id)!;
        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(product.price) * 100),
            product_data: {
              name: product.title,
            },
          },
        };
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/processing`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        orderId: order.id,
        orderType: "PRODUCT",
      },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (err) {
    console.error("Product checkout error:", err);
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 }
    );
  }
}
