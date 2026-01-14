// lib/actions/user.actions.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const image = formData.get("image") as string | null;

  // Validation
  const errors: Record<string, string[]> = {};
  if (!name || name.trim().length < 2) {
    errors.name = ["Name must be at least 2 characters"];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        image: image || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      data: {
        name: updatedUser.name,
        image: updatedUser.image,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
