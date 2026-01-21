// checkout/product ************NOT USED
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { items } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }

  // Reload products from DB
  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      isActive: true,
    },
  });

  if (products.length !== items.length) {
    return NextResponse.json(
      { error: "Invalid products in cart" },
      { status: 400 }
    );
  }

  // Compute amount safely
  const amount = products.reduce((sum, product) => {
    const item = items.find((i) => i.productId === product.id)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      type: "PRODUCT",
      status: "PENDING",
      amount: Math.round(amount * 100),
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: products.map((product) => {
      const item = items.find((i) => i.productId === product.id)!;
      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.title },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    }),
    metadata: {
      orderId: order.id,
      orderType: "PRODUCT",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/processing`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
  });

  return NextResponse.json({ url: session.url });
}
