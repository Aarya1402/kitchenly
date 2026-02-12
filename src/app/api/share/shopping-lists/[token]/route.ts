export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const list = await prisma.shoppingList.findFirst({
    where: {
      shareToken: token,
      isShared: true,
    },
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

  if (!list) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 404 }
    );
  }

  /* build checked map */
  const checkedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked])
  );

  /* aggregate items */
  const aggregated = new Map<
    string,
    {
      name: string;
      quantity: number;
      unit: string;
      category: string;
      isChecked: boolean;
    }
  >();

  for (const r of list.recipes) {
    const scale = r.servingsUsed / r.baseServings;

    for (const ing of r.recipe.ingredients) {
      const key = ing.name.trim().toLowerCase();
      const qty = Number(ing.quantity.match(/[\d.]+/)?.[0] ?? 1);

      const existing = aggregated.get(key);
      if (existing) {
        existing.quantity += qty * scale;
      } else {
        aggregated.set(key, {
          name: ing.name,
          quantity: qty * scale,
          unit: ing.quantity.replace(/[\d.\s]/g, "") || "piece",
          category: ing.category || "Other",
          isChecked: checkedMap.get(key) ?? false,
        });
      }
    }
  }

  for (const m of list.manualItems) {
    const existing = aggregated.get(m.ingredientKey);
    if (existing) {
      existing.quantity += m.quantity;
    } else {
      aggregated.set(m.ingredientKey, {
        name: m.ingredientKey,
        quantity: m.quantity,
        unit: m.unit,
        category: m.category,
        isChecked: checkedMap.get(m.ingredientKey) ?? false,
      });
    }
  }

  /* group by category */
  type AggregatedItem = {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    isChecked: boolean;
  };

  const groups: Record<string, AggregatedItem[]> = {};
  for (const item of aggregated.values()) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  return NextResponse.json({
    title: list.title,
    groups,
  });
}
