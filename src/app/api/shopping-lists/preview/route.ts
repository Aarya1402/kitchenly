import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORY } from "@/constants/default-category";
import { CATEGORY_MAP } from "@/constants/category-map";

/* ───────── Helpers ───────── */

function canonicalizeName(name: string) {
  return name.trim().toLowerCase();
}

function parseQuantity(input: string) {
  const match = input.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) {
    return { value: 1, unit: "piece" };
  }

  return {
    value: Number(match[1]),
    unit: match[2]?.trim() || "piece",
  };
}

function inferCategory(ingredientName: string): string {
  const key = ingredientName.split(" ")[0].toLowerCase();
  return CATEGORY_MAP[key] || DEFAULT_CATEGORY;
}

/* ───────────────────── POST /preview ───────────────────── */

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const recipeIds: string[] = body.recipeIds;

  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return NextResponse.json({ error: "No recipes selected" }, { status: 400 });
  }

  /* ───────── Fetch recipes ───────── */

  const recipes = await prisma.recipe.findMany({
    where: {
      id: { in: recipeIds },
    },
    include: {
      ingredients: true,
    },
  });

  /* ───────── Aggregate ingredients ───────── */

  type AggregatedItem = {
    ingredientKey: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
  };

  const aggregated = new Map<string, AggregatedItem>();

  for (const recipe of recipes) {
    const baseServings = recipe.servings || 1;
    const scaleFactor = 1; // preview uses default servings

    for (const ing of recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);
      const ingredientKey = canonicalizeName(ing.name);

      const existing = aggregated.get(ingredientKey);

      if (existing) {
        // only sum if unit matches
        if (existing.unit === parsed.unit) {
          existing.quantity += parsed.value * scaleFactor;
        } else {
          // different unit → keep separate key
          aggregated.set(`${ingredientKey}:${parsed.unit}`, {
            ingredientKey: `${ingredientKey}:${parsed.unit}`,
            name: ing.name,
            quantity: parsed.value * scaleFactor,
            unit: parsed.unit,
            category: inferCategory(ing.name),
          });
        }
      } else {
        aggregated.set(ingredientKey, {
          ingredientKey,
          name: ing.name,
          quantity: parsed.value * scaleFactor,
          unit: parsed.unit,
          category: inferCategory(ing.name),
        });
      }
    }
  }

  /* ───────── Group by category ───────── */

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of aggregated.values()) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  /* ───────── Response ───────── */

  return NextResponse.json({
    recipes: recipes.map((r) => ({
      recipeId: r.id,
      title: r.title,
      baseServings: r.servings,
      servingsUsed: r.servings, // preview = default
    })),
    groups,
  });
}
