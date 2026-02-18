"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getUserPreferences() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const md = user.privateMetadata ?? {};

  return {
    defaultServings:
      typeof md.defaultServings === "number" ? md.defaultServings : 2,
    dietaryPreferences: Array.isArray(md.dietaryPreferences)
      ? (md.dietaryPreferences as string[])
      : [],
  };
}

export async function updateUserPreferences(
  defaultServings: number,
  dietaryPreferences: string[]
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (
    typeof defaultServings !== "number" ||
    defaultServings < 1 ||
    defaultServings > 20 ||
    !Array.isArray(dietaryPreferences)
  ) {
    throw new Error("Invalid input");
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      defaultServings,
      dietaryPreferences,
    },
  });

  return { success: true };
}
