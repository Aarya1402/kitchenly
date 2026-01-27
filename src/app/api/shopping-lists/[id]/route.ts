import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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
  context: { params: Promise<{ id: string }> },
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

  /* ───────── Build checked map ───────── */

  const checkedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.checked]),
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
          category: "Other",
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

  /* ───────── Group by category + attach checked ───────── */

  const groups: Record<string, any[]> = {};

  for (const item of aggregated.values()) {
    const checked = checkedMap.get(item.ingredientKey) ?? false;

    const category = item.category || "Other";

    if (!groups[category]) groups[category] = [];

    groups[category].push({
      ...item,
      checked,
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
