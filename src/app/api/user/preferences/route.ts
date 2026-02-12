import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET user preferences (read privateMetadata)
 */
export async function GET() {
  const session = await auth();

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(session.userId);

  const md = user.privateMetadata ?? {};

  return NextResponse.json({
    defaultServings:
      typeof md.defaultServings === "number" ? md.defaultServings : 2,
    dietaryPreferences: Array.isArray(md.dietaryPreferences)
      ? md.dietaryPreferences
      : [],
  });
}

/**
 * UPDATE user preferences (write privateMetadata)
 */
export async function POST(req: Request) {
  const session = await auth();

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { defaultServings, dietaryPreferences } = await req.json();

  if (
    typeof defaultServings !== "number" ||
    defaultServings < 1 ||
    defaultServings > 20 ||
    !Array.isArray(dietaryPreferences)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(session.userId, {
    privateMetadata: {
      defaultServings,
      dietaryPreferences,
    },
  });

  return NextResponse.json({ success: true });
}
