import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ingredientKey, isChecked } = await req.json();

  if (!ingredientKey || typeof isChecked !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  await prisma.shoppingItemState.upsert({
    where: {
      shoppingListId_ingredientKey: {
        shoppingListId: id,
        ingredientKey,
      },
    },
    update: {
      isChecked,
    },
    create: {
      shoppingListId: id,
      ingredientKey,
      isChecked,
    },
  });

  return NextResponse.json({ success: true });
}
