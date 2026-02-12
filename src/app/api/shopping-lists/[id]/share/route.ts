export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "node:crypto";

/* ───────── Enable / regenerate share link ───────── */
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (list.shareToken) {
    return NextResponse.json({ token: list.shareToken });
  }

  const token = randomUUID();

  await prisma.shoppingList.update({
    where: { id },
    data: {
      shareToken: token,
      isShared: true,
    },
  });

  return NextResponse.json({ token });
}

/* ───────── Disable share link ───────── */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.shoppingList.update({
    where: { id },
    data: {
      shareToken: null,
      isShared: false,
    },
  });

  return NextResponse.json({ success: true });
}
