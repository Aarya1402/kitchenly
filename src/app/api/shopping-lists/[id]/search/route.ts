import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import type { AggregatedItem } from "@/types/aggregatedItems";

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
    unit: match[2] || "piece",
  };
}

/* ───────── GET /search ───────── */

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  const categoriesParam = searchParams.get("categories");
  const categoryFilters = categoriesParam ? categoriesParam.split(",") : [];

  /* ───────── Fetch list ───────── */
  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      recipes: {
        include: {
          recipe: {
            include: { ingredients: true },
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

  /* ───────── Checked state map ───────── */
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

  // From recipes
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

  // From manual items
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
        category: m.category || "Other",
      });
    }
  }

  /* ───────── Filter AFTER aggregation ───────── */
  let items = Array.from(aggregated.values());

  // 🔍 Search (name OR ingredientKey)
  if (q) {
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.ingredientKey.toLowerCase().includes(q)
    );
  }

  // 🗂 Multi-category filter (OR logic)
  if (categoryFilters.length > 0) {
    items = items.filter((i) => categoryFilters.includes(i.category));
  }

  /* ───────── Regroup + attach isChecked ───────── */
  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of items) {
    const category = item.category || "Other";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push({
      ...item,
      isChecked: isCheckedMap.get(item.ingredientKey) ?? false,
    });
  }

  /* ───────── Response ───────── */
  return NextResponse.json({
    id: list.id,
    title: list.title,
    groups,
  });
}
