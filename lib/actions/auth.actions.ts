// lib/actions/auth.actions.ts
"use server";

import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { sendEmail } from "../sendEmail";
import { passwordResetEmail } from "../emails/passwordResetEmail";

export async function signUpAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Sign in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // User created, sign in failed - still success
  }

  // New users always go to user dashboard
  redirect("/dashboard");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string | null;

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  // Determine redirect URL
  const redirectUrl = getRedirectUrl(user?.role, callbackUrl);
  redirect(redirectUrl);
}

/**
 * Determine where to redirect after sign in
 */
function getRedirectUrl(
  role: string | undefined,
  callbackUrl: string | null,
): string {
  const isAdmin = role === "ADMIN";

  // If there's a callback URL, validate it
  if (callbackUrl) {
    // Don't allow non-admins to access admin routes
    if (callbackUrl.startsWith("/admin") && !isAdmin) {
      return "/dashboard";
    }

    // Respect valid callback URLs
    if (isValidCallbackUrl(callbackUrl)) {
      return callbackUrl;
    }
  }

  // Default redirects
  return isAdmin ? "/admin" : "/dashboard";
}

/**
 * Validate callback URL to prevent open redirect
 */
function isValidCallbackUrl(url: string): boolean {
  // Only allow relative URLs starting with /
  if (!url.startsWith("/")) return false;

  // Don't allow auth routes as callback
  if (url.startsWith("/auth")) return false;

  // Don't allow protocol-relative URLs
  if (url.startsWith("//")) return false;

  return true;
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/auth");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Send email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your W-Pull password",
      html: passwordResetEmail({
        resetUrl,
        email: user.email,
      }),
      from: "W-Pull Security <security@emails.teevong.com>",
    });
  } catch (error) {
    console.error("Password reset email failed:", error);
  }

  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password) {
    return { error: "Invalid request" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "Invalid or expired token" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return { success: true };
}
