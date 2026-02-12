import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { AggregatedItem } from "@/types/aggregatedItems";

/* ───────── Helpers ───────── */

function canonicalizeName(name: string) {
  return name.trim().toLowerCase();
}

function parseQuantity(input: string) {
  const match = input.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return { value: 1, unit: "piece" };
  return {
    value: Number(match[1]),
    unit: match[2] || "piece",
  };
}

/* ───────── GET /shopping-lists/:id ───────── */

export async function GET(
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
    include: {
      recipes: {
        include: {
          recipe: {
            include: {
              ingredients: true,
            },
          },
        },
      },
      manualItems: true,
      itemStates: true,
    },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  /* ───────── Build isChecked map ───────── */

  const isCheckedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked])
  );

  /* ───────── Aggregate ingredients ───────── */

  const aggregated = new Map<
    string,
    {
      ingredientKey: string;
      name: string;
      quantity: number;
      unit: string;
      category: string;
    }
  >();

  // from recipes
  for (const r of list.recipes) {
    const scale = r.servingsUsed / r.baseServings;

    for (const ing of r.recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);
      const key = canonicalizeName(ing.name);

      const existing = aggregated.get(key);

      if (existing) {
        existing.quantity += parsed.value * scale;
      } else {
        aggregated.set(key, {
          ingredientKey: key,
          name: ing.name,
          quantity: parsed.value * scale,
          unit: parsed.unit,
          category: ing.category || "Other",
        });
      }
    }
  }

  // from manual items
  for (const m of list.manualItems) {
    const existing = aggregated.get(m.ingredientKey);

    if (existing) {
      existing.quantity += m.quantity;
    } else {
      aggregated.set(m.ingredientKey, {
        ingredientKey: m.ingredientKey,
        name: m.ingredientKey,
        quantity: m.quantity,
        unit: m.unit,
        category: m.category,
      });
    }
  }

  /* ───────── Group by category + attach isChecked ───────── */

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of aggregated.values()) {
    const isChecked = isCheckedMap.get(item.ingredientKey) ?? false;

    const category = item.category || "Other";

    if (!groups[category]) groups[category] = [];

    groups[category].push({
      ...item,
      isChecked,
    });
  }

  /* ───────── Response ───────── */

  return NextResponse.json({
    id: list.id,
    title: list.title,
    recipes: list.recipes.map((r) => ({
      recipeId: r.recipeId,
      title: r.recipeTitle,
      baseServings: r.baseServings,
      servingsUsed: r.servingsUsed,
    })),
    groups,
  });
}

/* ───────────────────── PUT /shopping-lists/[id] ─────────────────────
   Add a recipe to an existing shopping list
--------------------------------------------------------------------- */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shoppingListId = id;
  const body = await req.json();

  const { recipeId, servingsUsed } = body;

  if (!recipeId) {
    return NextResponse.json(
      { error: "recipeId is required" },
      { status: 400 }
    );
  }

  /* ───────── Verify list ownership ───────── */

  const list = await prisma.shoppingList.findUnique({
    where: { id: shoppingListId },
    include: { recipes: true },
  });

  if (!list || list.userId !== userId) {
    return NextResponse.json(
      { error: "Shopping list not found" },
      { status: 404 }
    );
  }

  /* ───────── Prevent duplicate recipe ───────── */

  const alreadyExists = list.recipes.some((r) => r.recipeId === recipeId);

  if (alreadyExists) {
    return NextResponse.json(
      { error: "Recipe already added to this list" },
      { status: 409 }
    );
  }

  /* ───────── Fetch recipe (immutable) ───────── */

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe || recipe.userId !== userId) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  /* ───────── Add recipe to list ───────── */

  await prisma.recipeInList.create({
    data: {
      shoppingListId,
      recipeId,
      recipeTitle: recipe.title,
      baseServings: recipe.servings,
      servingsUsed: servingsUsed ?? recipe.servings,
    },
  });

  return NextResponse.json({ success: true });
}
