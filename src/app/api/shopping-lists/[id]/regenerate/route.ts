import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipeId, servingsUsed } = await req.json();

  if (!recipeId || !servingsUsed) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const recipeLink = await prisma.recipeInList.findUnique({
    where: {
      shoppingListId_recipeId: {
        shoppingListId: id,
        recipeId,
      },
    },
  });

  if (!recipeLink) {
    return NextResponse.json({ error: "Recipe not in list" }, { status: 404 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe missing" }, { status: 404 });
  }

  const scaleFactor = servingsUsed / recipeLink.baseServings;
  function parseQuantity(input: string): {
    value: number;
    unit: string;
  } {
    const match = input.trim().match(/^([\d.]+)\s*(.*)$/);

    if (!match) {
      return { value: 1, unit: "piece" };
    }

    return {
      value: Number(match[1]),
      unit: match[2] || "piece",
    };
  }

  function canonicalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  await prisma.$transaction([
    prisma.listIngredient.deleteMany({
      where: { recipeInListId: recipeLink.id },
    }),
    prisma.recipeInList.update({
      where: { id: recipeLink.id },
      data: {
        servingsUsed,
        ingredients: {
          create: recipe.ingredients.map((i) => {
            const parsed = parseQuantity(i.quantity);

            return {
              ingredientKey: canonicalizeName(i.name),
              quantity: parsed.value * scaleFactor,
              unit: parsed.unit,
              category: "Other",
            };
          }),
        },
      },
    }),
  ]);

  const updated = await prisma.recipeInList.findUnique({
    where: { id: recipeLink.id },
    include: { ingredients: true },
  });

  return NextResponse.json({
    recipeId,
    servingsUsed,
    ingredients: updated?.ingredients ?? [],
  });
}
