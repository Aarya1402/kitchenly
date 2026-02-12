import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { ManualItemSaveInput } from "@/types/shoppingListApi";
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, manualItems } = await req.json();

  if (!title || !Array.isArray(manualItems)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.manualItem.deleteMany({
      where: { shoppingListId: id },
    }),
    prisma.manualItem.createMany({
      data: manualItems.map((i: ManualItemSaveInput) => ({
        shoppingListId: id,
        ingredientKey: i.ingredientKey,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
      })),
    }),
    prisma.shoppingList.update({
      where: { id },
      data: { title },
    }),
  ]);

  return NextResponse.json({
    success: true,
    shoppingListId: id,
  });
}
