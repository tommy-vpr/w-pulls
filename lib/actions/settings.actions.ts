"use server";

import { auth, signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { uploadToGCS, deleteFromGCS, getFilenameFromUrl } from "@/lib/gcs";
import sharp from "sharp";

// Update Profile
export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { success: false, error: "Name and email are required" };
  }

  // Check if email is already taken by another user
  if (email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return { success: false, error: "Email already in use" };
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email },
    });

    return {
      success: true,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Update Password
export async function updatePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.password) {
      return { error: "Cannot change password for OAuth accounts" };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    return { error: "Failed to update password" };
  }
}

// Update Avatar
export async function updateAvatarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Use JPG, PNG, GIF, or WebP" };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 5MB" };
  }

  try {
    // Get current user to delete old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Process image with sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(buffer)
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    // Generate filename
    const filename = `avatars/${session.user.id}-${Date.now()}.webp`;

    // Upload to GCS
    const imageUrl = await uploadToGCS(processedBuffer, filename, "image/webp");

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    // Delete old avatar from GCS if it's our own upload
    if (
      currentUser?.image &&
      currentUser.image.includes("storage.googleapis.com")
    ) {
      const oldFilename = getFilenameFromUrl(currentUser.image);
      if (oldFilename && oldFilename.startsWith("avatars/")) {
        await deleteFromGCS(oldFilename);
      }
    }

    return {
      success: true,
      data: {
        image: updatedUser.image,
      },
    };
  } catch (error) {
    console.error("Update avatar error:", error);
    return { success: false, error: "Failed to upload avatar" };
  }
}

// Remove Avatar
export async function removeAvatarAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete from GCS if it's our upload
    if (user?.image && user.image.includes("storage.googleapis.com")) {
      const filename = getFilenameFromUrl(user.image);
      if (filename && filename.startsWith("avatars/")) {
        await deleteFromGCS(filename);
      }
    }

    // Set image to null
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return {
      success: true,
      data: {
        image: null,
      },
    };
  } catch (error) {
    console.error("Remove avatar error:", error);
    return { success: false, error: "Failed to remove avatar" };
  }
}

// Delete Account
export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Get user to delete avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete avatar from GCS
    if (user?.image && user.image.includes("storage.googleapis.com")) {
      const filename = getFilenameFromUrl(user.image);
      if (filename && filename.startsWith("avatars/")) {
        await deleteFromGCS(filename);
      }
    }

    // Delete user (cascades to related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    // Sign out
    await signOut({ redirect: false });
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account" };
  }

  redirect("/auth");
}
