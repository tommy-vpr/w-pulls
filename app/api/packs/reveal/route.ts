import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!order) throw new Error("Order not found");
      if (order.userId !== session.user.id) throw new Error("Forbidden");

      // 🔒 ONE-TIME GUARD
      if (order.revealedAt) {
        return {
          alreadyRevealed: true,
          product: order.items[0]?.product,
        };
      }

      if (order.status !== "COMPLETED") {
        throw new Error("Order not eligible");
      }

      // ✅ MARK AS REVEALED (THIS IS THE ONLY PLACE)
      await tx.order.update({
        where: { id: orderId },
        data: {
          revealedAt: new Date(),
        },
      });

      await tx.orderAudit.create({
        data: {
          orderId,
          action: "PRODUCT_REVEALED",
          performedBy: session.user.id,
        },
      });

      return {
        revealed: true,
        product: order.items[0]?.product,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
