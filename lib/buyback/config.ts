// lib/buyback/config.ts

import { ProductTier } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

// ===========================================
// BUYBACK RATES BY TIER
// ===========================================

/**
 * Percentage of product value offered for buyback (0.0 - 1.0)
 * Higher tiers get better rates to incentivize keeping lower-value cards
 */
export const BUYBACK_RATES: Record<ProductTier, number> = {
  COMMON: 0.5, // 50%
  UNCOMMON: 0.55, // 55%
  RARE: 0.6, // 60%
  ULTRA_RARE: 0.7, // 70%
  SECRET_RARE: 0.75, // 75%
  BANGER: 0.8, // 80%
  GRAIL: 0.85, // 85%
};

/**
 * Get the buyback rate for a given tier
 */
export function getBuybackRate(tier: ProductTier): number {
  return BUYBACK_RATES[tier] ?? 0.5;
}

/**
 * Calculate the buyback amount for a product
 * @param productPriceCents - Product price in cents
 * @param tier - Product tier
 * @returns Buyback amount in cents
 */
export function calculateBuybackAmount(
  productPriceCents: number,
  tier: ProductTier,
): number {
  const rate = getBuybackRate(tier);
  return Math.floor(productPriceCents * rate);
}

// ===========================================
// QUOTE EXPIRATION
// ===========================================

/**
 * How long a buyback quote is valid (in seconds)
 * After this, user must request a new quote
 */
export const QUOTE_EXPIRATION_SECONDS = 600; // 10 minutes

/**
 * Minimum buyback amount in cents
 * Prevents micro-transactions
 */
export const MINIMUM_BUYBACK_AMOUNT = 100; // $1.00

// ===========================================
// WITHDRAWAL SETTINGS
// ===========================================

/**
 * Minimum withdrawal amount in cents
 */
export const MINIMUM_WITHDRAWAL_AMOUNT = 1000; // $10.00

/**
 * Maximum withdrawal amount per request in cents
 * Set to null for no limit
 */
export const MAXIMUM_WITHDRAWAL_AMOUNT: number | null = null; // No limit

/**
 * Hold period for new credits before they can be withdrawn (in hours)
 * Helps prevent chargeback fraud
 * Set to 0 to disable
 */
export const CREDIT_HOLD_PERIOD_HOURS = 0; // 24 hours

/**
 * Require minimum account age for first withdrawal (in days)
 * Set to 0 to disable
 */
export const MINIMUM_ACCOUNT_AGE_DAYS = 0;

// ===========================================
// QUOTE TOKEN SIGNING
// ===========================================

const QUOTE_SECRET = new TextEncoder().encode(
  process.env.BUYBACK_QUOTE_SECRET ||
    process.env.AUTH_SECRET ||
    "fallback-secret-change-me",
);

export interface QuotePayload {
  orderItemId: string;
  userId: string;
  amount: number;
  tier: ProductTier;
  productId: string;
  exp: number;
}

/**
 * Generate a signed quote token
 * This ensures the quote can't be tampered with
 */
export async function generateQuoteToken(
  payload: Omit<QuotePayload, "exp">,
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + QUOTE_EXPIRATION_SECONDS;

  const token = await new SignJWT({ ...payload, exp: expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(QUOTE_SECRET);

  return token;
}

/**
 * Verify and decode a quote token
 * Returns null if invalid or expired
 */
export async function verifyQuoteToken(
  token: string,
): Promise<QuotePayload | null> {
  try {
    const { payload } = await jwtVerify(token, QUOTE_SECRET);
    return payload as unknown as QuotePayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get expiration timestamp for a new quote
 */
export function getQuoteExpiresAt(): Date {
  return new Date(Date.now() + QUOTE_EXPIRATION_SECONDS * 1000);
}

/**
 * Get seconds remaining on a quote
 */
export function getQuoteSecondsRemaining(expiresAt: Date): number {
  const remaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}
