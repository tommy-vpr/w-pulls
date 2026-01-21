// lib/emails/send-order-confirmation.ts
import { resend } from "@/lib/resend";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface SendOrderConfirmationParams {
  to: string;
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

function generateOrderConfirmationHTML(
  params: Omit<SendOrderConfirmationParams, "to">,
): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wpull.com";

  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; vertical-align: top; width: 70px;">
          ${
            item.image
              ? `<img src="${item.image}" width="60" height="60" alt="${item.name}" style="border-radius: 8px; border: 1px solid rgba(0,255,255,0.2);" />`
              : `<div style="width: 60px; height: 60px; border-radius: 8px; background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.2);"></div>`
          }
        </td>
        <td style="padding: 12px 0; vertical-align: middle; padding-left: 15px;">
          <p style="font-size: 14px; font-weight: bold; color: #ffffff; margin: 0 0 4px 0;">${item.name}</p>
          <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0;">Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; vertical-align: middle; text-align: right; width: 80px;">
          <p style="font-size: 14px; font-weight: bold; color: #00ffff; margin: 0;">$${(item.price / 100).toFixed(2)}</p>
        </td>
      </tr>
    `,
    )
    .join("");

  const shippingAddressHTML = shippingAddress
    ? `
      <hr style="border: none; border-top: 1px solid rgba(0,255,255,0.2); margin: 20px 0;" />
      <div style="padding: 0;">
        <p style="font-size: 12px; font-weight: bold; color: #00ffff; letter-spacing: 2px; margin: 0 0 20px 0; text-transform: uppercase;">Shipping Address</p>
        <p style="font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0;">
          ${shippingAddress.line1}<br />
          ${shippingAddress.line2 ? `${shippingAddress.line2}<br />` : ""}
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br />
          ${shippingAddress.country}
        </p>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed - W-Pull #${orderNumber}</title>
</head>
<body style="background-color: #030812; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0;">
      <p style="font-size: 28px; font-weight: bold; color: #00ffff; letter-spacing: 4px; margin: 0;">W-PULL</p>
      <p style="font-size: 10px; color: rgba(0,255,255,0.5); letter-spacing: 3px; margin: 4px 0 0 0;">CARD SYSTEM</p>
    </div>

    <!-- Order Confirmed Banner -->
    <div style="background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.05)); border: 1px solid rgba(0,255,255,0.3); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <p style="font-size: 48px; color: #00ffff; margin: 0 0 10px 0;">✓</p>
      <h1 style="font-size: 24px; color: #ffffff; margin: 0 0 10px 0;">Order Confirmed!</h1>
      <p style="font-size: 16px; color: rgba(255,255,255,0.7); margin: 0;">Thanks for your purchase, ${customerName}!</p>
    </div>

    <!-- Order Details -->
    <div style="background: rgba(12,20,28,0.95); border: 1px solid rgba(0,255,255,0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 50%; text-align: center;">
            <p style="font-size: 10px; color: rgba(0,255,255,0.6); letter-spacing: 1px; margin: 0 0 4px 0;">ORDER NUMBER</p>
            <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 0;">#${orderNumber}</p>
          </td>
          <td style="width: 50%; text-align: center;">
            <p style="font-size: 10px; color: rgba(0,255,255,0.6); letter-spacing: 1px; margin: 0 0 4px 0;">ORDER DATE</p>
            <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 0;">${orderDate}</p>
          </td>
        </tr>
      </table>
    </div>

    <hr style="border: none; border-top: 1px solid rgba(0,255,255,0.2); margin: 20px 0;" />

    <!-- Order Items -->
    <div style="padding: 0;">
      <p style="font-size: 12px; font-weight: bold; color: #00ffff; letter-spacing: 2px; margin: 0 0 20px 0; text-transform: uppercase;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHTML}
      </table>
    </div>

    <hr style="border: none; border-top: 1px solid rgba(0,255,255,0.2); margin: 20px 0;" />

    <!-- Order Totals -->
    <div style="background: rgba(12,20,28,0.95); border: 1px solid rgba(0,255,255,0.2); border-radius: 8px; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 4px 0;"><p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0;">Subtotal</p></td>
          <td style="padding: 4px 0; text-align: right;"><p style="font-size: 14px; color: #ffffff; margin: 0;">$${(subtotal / 100).toFixed(2)}</p></td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0;">Tax</p></td>
          <td style="padding: 4px 0; text-align: right;"><p style="font-size: 14px; color: #ffffff; margin: 0;">$${(tax / 100).toFixed(2)}</p></td>
        </tr>
        <tr>
          <td style="padding: 4px 0;"><p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0;">Shipping</p></td>
          <td style="padding: 4px 0; text-align: right;"><p style="font-size: 14px; color: #ffffff; margin: 0;">${shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}</p></td>
        </tr>
      </table>
      <hr style="border: none; border-top: 1px solid rgba(0,255,255,0.1); margin: 10px 0;" />
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td><p style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 0;">Total</p></td>
          <td style="text-align: right;"><p style="font-size: 20px; font-weight: bold; color: #00ffff; margin: 0;">$${(total / 100).toFixed(2)}</p></td>
        </tr>
      </table>
    </div>

    ${shippingAddressHTML}

    <hr style="border: none; border-top: 1px solid rgba(0,255,255,0.2); margin: 20px 0;" />

    <!-- CTA -->
    <div style="text-align: center; padding: 20px 0;">
      <a href="${baseUrl}/dashboard/orders" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 30px; border-radius: 8px; letter-spacing: 1px; text-transform: uppercase;">View Order Details</a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 0;">
      <p style="font-size: 12px; color: rgba(255,255,255,0.5); margin: 0 0 10px 0;">
        Questions about your order? <a href="${baseUrl}/support" style="color: #00ffff; text-decoration: underline;">Contact Support</a>
      </p>
      <p style="font-size: 11px; color: rgba(255,255,255,0.3); margin: 0;">© ${new Date().getFullYear()} W-Pull. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams,
) {
  const { to, ...emailProps } = params;

  try {
    const { error } = await resend.emails.send({
      from: "W-Pull <orders@emails.teevong.com>",
      to,
      subject: `Order Confirmed - W-Pull #${params.orderNumber}`,
      html: generateOrderConfirmationHTML(emailProps),
    });

    if (error) {
      console.error("Failed to send order confirmation email:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Order confirmation email error:", error);
    return { success: false, error };
  }
}

// // lib/emails/send-order-confirmation.ts
// import { resend } from "@/lib/resend";
// import OrderConfirmationEmail from "./order-confirmation";

// interface OrderItem {
//   name: string;
//   quantity: number;
//   price: number;
//   image?: string;
// }

// interface SendOrderConfirmationParams {
//   to: string;
//   customerName: string;
//   orderNumber: string;
//   orderDate: string;
//   items: OrderItem[];
//   subtotal: number;
//   tax: number;
//   shipping: number;
//   total: number;
//   shippingAddress?: {
//     line1: string;
//     line2?: string;
//     city: string;
//     state: string;
//     postalCode: string;
//     country: string;
//   };
// }

// export async function sendOrderConfirmationEmail(
//   params: SendOrderConfirmationParams,
// ) {
//   const { to, ...emailProps } = params;

//   try {
//     const { error } = await resend.emails.send({
//       from: "W-Pull <orders@emails.teevong.com>",
//       to,
//       subject: `Order Confirmed - W-Pull #${params.orderNumber}`,
//       react: <OrderConfirmationEmail {...emailProps} />,
//     });

//     if (error) {
//       console.error("Failed to send order confirmation email:", error);
//       return { success: false, error };
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Order confirmation email error:", error);
//     return { success: false, error };
//   }
// }
