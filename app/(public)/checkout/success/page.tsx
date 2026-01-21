// app/checkout/success/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { HolographicBackground } from "@/components/ui/HolographicBackground";
import { OrderSuccessContent } from "@/components/checkout/OrderSuccessContent";
import { sendOrderConfirmationEmail } from "@/lib/emails/send-order-confirmation";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

async function getOrderFromSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: [
      "line_items",
      "line_items.data.price.product",
      "total_details.breakdown",
      "shipping_cost",
    ],
  });

  if (!session || session.payment_status !== "paid") {
    return null;
  }

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  if (!order) {
    return null;
  }

  // Get pricing from Stripe
  const subtotal = session.amount_subtotal || 0;
  const tax = session.total_details?.amount_tax || 0;
  const shipping = session.shipping_cost?.amount_total || 0;
  const total = session.amount_total || order.amount;

  // Get shipping address
  const shippingAddress = session.shipping_details?.address;

  // Update order status if still pending
  if (order.status === "PENDING") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        stripeSessionId: sessionId,
        subtotal,
        tax,
        shipping,
        amount: total,
        shippingLine1: shippingAddress?.line1 || null,
        shippingLine2: shippingAddress?.line2 || null,
        shippingCity: shippingAddress?.city || null,
        shippingState: shippingAddress?.state || null,
        shippingPostal: shippingAddress?.postal_code || null,
        shippingCountry: shippingAddress?.country || null,
      },
    });

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        to: order.customerEmail || order.user?.email || "",
        customerName: order.customerName || order.user?.name || "Customer",
        orderNumber: order.id.slice(-8).toUpperCase(),
        orderDate: new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: order.items.map((item) => ({
          name: item.product.title,
          quantity: item.quantity,
          price: Number(item.unitPrice) * 100,
          image: item.product.imageUrl || undefined,
        })),
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: shippingAddress
          ? {
              line1: shippingAddress.line1 || "",
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city || "",
              state: shippingAddress.state || "",
              postalCode: shippingAddress.postal_code || "",
              country: shippingAddress.country || "",
            }
          : undefined,
      });
    } catch (emailError) {
      console.error("Email failed but continuing:", emailError);
    }
  }

  return {
    order,
    shippingAddress,
    pricing: {
      subtotal,
      tax,
      shipping,
      total,
    },
  };
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  const data = await getOrderFromSession(session_id);

  if (!data) {
    redirect("/");
  }

  const { order, shippingAddress, pricing } = data;

  return (
    <HolographicBackground particles particleCount={30} hexGrid dataStreams>
      <Suspense fallback={<SuccessLoading />}>
        <OrderSuccessContent
          orderNumber={order.id.slice(-8).toUpperCase()}
          orderDate={new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          items={order.items.map((item) => ({
            id: item.id,
            name: item.product.title,
            quantity: item.quantity,
            price: Number(item.unitPrice) * 100,
            image: item.product.imageUrl,
          }))}
          subtotal={pricing.subtotal}
          tax={pricing.tax}
          shipping={pricing.shipping}
          total={pricing.total}
          customerEmail={order.customerEmail || order.user?.email || ""}
          shippingAddress={
            shippingAddress
              ? {
                  line1: shippingAddress.line1 || "",
                  line2: shippingAddress.line2 || undefined,
                  city: shippingAddress.city || "",
                  state: shippingAddress.state || "",
                  postalCode: shippingAddress.postal_code || "",
                  country: shippingAddress.country || "",
                }
              : undefined
          }
        />
      </Suspense>
    </HolographicBackground>
  );
}

function SuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-cyan-400 animate-pulse font-mono">
        Loading order details...
      </div>
    </div>
  );
}
