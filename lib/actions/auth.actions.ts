"use server";

import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

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

  // Admin always goes to dashboard
  if (user?.role === "ADMIN") {
    redirect("/dashboard");
  }

  // User goes to callbackUrl or /packs
  redirect(callbackUrl || "/packs");
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

  // TODO: Send email
  console.log(
    `Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  );

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
