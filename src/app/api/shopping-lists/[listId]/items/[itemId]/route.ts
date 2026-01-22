import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * PATCH toggles or sets the checked state of a shopping item.
 *
 * URL: /api/shopping-lists/:listId/items/:itemId
 * Body: { checked: boolean }
 */
export async function PATCH(
  req: Request,
  context: {
    params: Promise<{ listId: string; itemId: string }>;
  }
) {
  const { listId, itemId } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { checked } = body;

  if (typeof checked !== "boolean") {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  // Verify ownership: list belongs to user
  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    select: { userId: true },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // Update the item
  const updated = await prisma.shoppingItem.updateMany({
    where: {
      id: itemId,
      shoppingListId: listId,
    },
    data: {
      checked,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
