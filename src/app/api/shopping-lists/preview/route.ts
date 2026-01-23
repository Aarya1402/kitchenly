import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORY } from "@/constants/defualt-category";
import { CATEGORY_MAP } from "@/constants/category-map";

function parseQuantity(quantity: string) {
  const match = quantity.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return null;

  return {
    value: Number(match[1]),
    unit: match[2]?.trim() || "",
  };
}

function inferCategory(ingredientName: string): string {
  const key = ingredientName.split(" ")[0];
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

  /* ───────── Fetch ingredients ───────── */

  const recipes = await prisma.recipe.findMany({
    where: {
      id: { in: recipeIds },
      userId,
    },
    include: {
      ingredients: true,
    },
  });

  /* ───────── Aggregate ───────── */

  type AggregatedItem = {
    name: string;
    quantity: string;
    category: string;
    checked: false;
  };

  const map = new Map<string, AggregatedItem>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);

      const key = ing.name;

      if (!parsed) {
        // fallback: treat as unique
        map.set(`${key}-${Math.random()}`, {
          name: ing.name,
          quantity: ing.quantity,
          category: inferCategory(ing.name),
          checked: false,
        });
        continue;
      }

      const existing = map.get(key);

      if (existing) {
        const existingParsed = parseQuantity(existing.quantity);

        if (existingParsed && existingParsed.unit === parsed.unit) {
          // identical unit → sum
          const total = existingParsed.value + parsed.value;

          existing.quantity = `${total} ${parsed.unit}`;
        } else {
          // different unit → separate entry
          map.set(`${key}-${parsed.unit}`, {
            name: ing.name,
            quantity: ing.quantity,
            category: inferCategory(ing.name),
            checked: false,
          });
        }
      } else {
        map.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          category: inferCategory(ing.name),
          checked: false,
        });
      }
    }
  }

  /* ───────── Group by category ───────── */

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of map.values()) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  return NextResponse.json({ groups });
}
