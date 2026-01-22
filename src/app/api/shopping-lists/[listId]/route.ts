import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const { listId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id:listId },
    include: { items: true },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // Group items by category (same shape as preview)
  const groups: Record<string, any[]> = {};

  for (const item of list.items) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  return NextResponse.json({
    id: list.id,
    title: list.title,
    groups,
  });
}
