import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { recipeId, servingsUsed, listId, listTitle } = body;

  if (!recipeId || !servingsUsed) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });

  if (!recipe || recipe.userId !== userId) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const shoppingList = listId
    ? await prisma.shoppingList.findUnique({
        where: { id: listId },
      })
    : await prisma.shoppingList.create({
        data: {
          userId,
          title: listTitle || "New Shopping List",
        },
      });

  if (!shoppingList || shoppingList.userId !== userId) {
    return NextResponse.json(
      { error: "Shopping list not found" },
      { status: 404 }
    );
  }

  // ensure recipe not already in list
  const existing = await prisma.recipeInList.findUnique({
    where: {
      shoppingListId_recipeId: {
        shoppingListId: shoppingList.id,
        recipeId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Recipe already added to list" },
      { status: 409 }
    );
  }

  const scaleFactor = servingsUsed / recipe.servings;

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

  const recipeInList = await prisma.recipeInList.create({
    data: {
      shoppingListId: shoppingList.id,
      recipeId,
      recipeTitle: recipe.title,
      baseServings: recipe.servings,
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
    include: {
      ingredients: true,
    },
  });

  return NextResponse.json({
    shoppingList: {
      id: shoppingList.id,
      title: shoppingList.title,
    },
    recipes: [
      {
        recipeId,
        title: recipe.title,
        baseServings: recipe.servings,
        servingsUsed,
      },
    ],
    ingredients: recipeInList.ingredients,
  });
}
