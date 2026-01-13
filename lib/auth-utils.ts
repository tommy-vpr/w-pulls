import { auth } from "@/lib/auth";
import { redirect, unauthorized } from "next/navigation";

/**
 * Get session or redirect to auth page
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  return session;
}

/**
 * Get session or return 401
 */
export async function requireAuthOrUnauthorized() {
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  return session;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Get session (nullable, no redirect)
 */
export async function getSession() {
  return await auth();
}
