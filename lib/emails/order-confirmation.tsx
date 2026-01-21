// lib/emails/order-confirmation.tsx
import * as React from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationEmailProps {
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

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wpull.com";

  return (
    <Html>
      <Head />
      <Preview>Order Confirmed - W-Pull #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>W-PULL</Text>
            <Text style={tagline}>CARD SYSTEM</Text>
          </Section>

          {/* Order Confirmed Banner */}
          <Section style={banner}>
            <Text style={bannerIcon}>✓</Text>
            <Heading style={bannerTitle}>Order Confirmed!</Heading>
            <Text style={bannerText}>
              Thanks for your purchase, {customerName}!
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={detailsSection}>
            <Row>
              <Column style={detailColumn}>
                <Text style={detailLabel}>ORDER NUMBER</Text>
                <Text style={detailValue}>#{orderNumber}</Text>
              </Column>
              <Column style={detailColumn}>
                <Text style={detailLabel}>ORDER DATE</Text>
                <Text style={detailValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section style={itemsSection}>
            <Text style={sectionTitle}>Order Summary</Text>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageColumn}>
                  {item.image ? (
                    <Img
                      src={item.image}
                      width="60"
                      height="60"
                      alt={item.name}
                      style={itemImage}
                    />
                  ) : (
                    <div style={itemImagePlaceholder} />
                  )}
                </Column>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>
                    ${(item.price / 100).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Order Totals */}
          <Section style={totalsSection}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${(subtotal / 100).toFixed(2)}</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Tax</Text>
              </Column>
              <Column>
                <Text style={totalValue}>${(tax / 100).toFixed(2)}</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Shipping</Text>
              </Column>
              <Column>
                <Text style={totalValue}>
                  {shipping === 0 ? "FREE" : `$${(shipping / 100).toFixed(2)}`}
                </Text>
              </Column>
            </Row>
            <Hr style={dividerLight} />
            <Row style={totalRow}>
              <Column>
                <Text style={grandTotalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={grandTotalValue}>${(total / 100).toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping Address */}
          {shippingAddress && (
            <>
              <Hr style={divider} />
              <Section style={addressSection}>
                <Text style={sectionTitle}>Shipping Address</Text>
                <Text style={addressText}>
                  {shippingAddress.line1}
                  {shippingAddress.line2 && <br />}
                  {shippingAddress.line2}
                  <br />
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                  <br />
                  {shippingAddress.country}
                </Text>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={`${baseUrl}/dashboard/orders`} style={ctaButton}>
              View Order Details
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order?{" "}
              <Link href={`${baseUrl}/support`} style={footerLink}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} W-Pull. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#030812",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const header = {
  textAlign: "center" as const,
  padding: "30px 0",
};

const logo = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#00ffff",
  letterSpacing: "4px",
  margin: "0",
  textShadow: "0 0 10px rgba(0,255,255,0.5)",
};

const tagline = {
  fontSize: "10px",
  color: "rgba(0,255,255,0.5)",
  letterSpacing: "3px",
  margin: "4px 0 0 0",
};

const banner = {
  background:
    "linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.05))",
  border: "1px solid rgba(0,255,255,0.3)",
  borderRadius: "12px",
  padding: "30px",
  textAlign: "center" as const,
  marginBottom: "30px",
};

const bannerIcon = {
  fontSize: "48px",
  color: "#00ffff",
  margin: "0 0 10px 0",
};

const bannerTitle = {
  fontSize: "24px",
  color: "#ffffff",
  margin: "0 0 10px 0",
};

const bannerText = {
  fontSize: "16px",
  color: "rgba(255,255,255,0.7)",
  margin: "0",
};

const detailsSection = {
  background: "rgba(12,20,28,0.95)",
  border: "1px solid rgba(0,255,255,0.2)",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
};

const detailColumn = {
  width: "50%",
  textAlign: "center" as const,
};

const detailLabel = {
  fontSize: "10px",
  color: "rgba(0,255,255,0.6)",
  letterSpacing: "1px",
  margin: "0 0 4px 0",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const divider = {
  borderColor: "rgba(0,255,255,0.2)",
  margin: "20px 0",
};

const dividerLight = {
  borderColor: "rgba(0,255,255,0.1)",
  margin: "10px 0",
};

const itemsSection = {
  padding: "0",
};

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#00ffff",
  letterSpacing: "2px",
  margin: "0 0 20px 0",
  textTransform: "uppercase" as const,
};

const itemRow = {
  marginBottom: "15px",
};

const itemImageColumn = {
  width: "70px",
  verticalAlign: "top" as const,
};

const itemImage = {
  borderRadius: "8px",
  border: "1px solid rgba(0,255,255,0.2)",
};

const itemImagePlaceholder = {
  width: "60px",
  height: "60px",
  borderRadius: "8px",
  background: "rgba(0,255,255,0.1)",
  border: "1px solid rgba(0,255,255,0.2)",
};

const itemDetailsColumn = {
  verticalAlign: "middle" as const,
  paddingLeft: "15px",
};

const itemName = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0 0 4px 0",
};

const itemQuantity = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  margin: "0",
};

const itemPriceColumn = {
  width: "80px",
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#00ffff",
  margin: "0",
};

const totalsSection = {
  background: "rgba(12,20,28,0.95)",
  border: "1px solid rgba(0,255,255,0.2)",
  borderRadius: "8px",
  padding: "20px",
};

const totalRow = {
  marginBottom: "8px",
};

const totalLabel = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.6)",
  margin: "0",
};

const totalValue = {
  fontSize: "14px",
  color: "#ffffff",
  margin: "0",
  textAlign: "right" as const,
};

const grandTotalLabel = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const grandTotalValue = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#00ffff",
  margin: "0",
  textAlign: "right" as const,
};

const addressSection = {
  padding: "0",
};

const addressText = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.8)",
  lineHeight: "1.6",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const ctaButton = {
  display: "inline-block",
  background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "14px 30px",
  borderRadius: "8px",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const footer = {
  textAlign: "center" as const,
  padding: "30px 0",
};

const footerText = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)",
  margin: "0 0 10px 0",
};

const footerLink = {
  color: "#00ffff",
  textDecoration: "underline",
};

const footerCopyright = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.3)",
  margin: "0",
};

export default OrderConfirmationEmail;
