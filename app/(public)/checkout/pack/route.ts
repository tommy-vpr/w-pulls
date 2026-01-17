import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPackById } from "@/lib/packs/config";

export async function POST(req: Request) {
  const { packId } = await req.json();

  if (!packId) {
    return NextResponse.json({ error: "Missing packId" }, { status: 400 });
  }

  const pack = getPackById(packId);
  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  // Create order (no items yet!)
  const order = await prisma.order.create({
    data: {
      type: "PACK",
      status: "PENDING",
      packId: pack.id,
      packName: pack.name,
      amount: pack.price, // already cents
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: pack.name,
            description: pack.description,
          },
          unit_amount: pack.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      packId: pack.id,
      orderType: "PACK",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/packs/reveal/${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/packs`,
  });

  return NextResponse.json({ url: session.url });
}
