import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ItemState } from "@/types/itemState";
import { AggregatedItem } from "@/types/aggregatedItems";
import type { ListForAggregate } from "@/types/aggregateInput";

/* ───────── helpers ───────── */

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

/* ───────── aggregator (single source of truth) ───────── */

export function aggregateShoppingList(list: ListForAggregate) {
  const itemStates = Array.isArray(list.itemStates) ? list.itemStates : [];

  const manualItems = Array.isArray(list.manualItems) ? list.manualItems : [];

  const isCheckedMap = new Map<string, boolean>(
    itemStates.map((s) => [s.ingredientKey, s.isChecked]),
  );

  const aggregated = new Map<string, AggregatedItem>();

  /* ───────── from recipes ───────── */

  for (const r of list.recipes ?? []) {
    const scale =
      r.baseServings && r.servingsUsed ? r.servingsUsed / r.baseServings : 1;

    for (const ing of r.recipe?.ingredients ?? []) {
      const parsed = parseQuantity(ing.quantity);

      const unit =
        ing.unit ?? // ← if you add unit column later
        parsed.unit ??
        "piece";

      const key = canonicalizeName(ing.name);
      aggregated.set(key, {
        ingredientKey: key,
        name: ing.name,
        quantity: parsed.value * scale,
        unit,
        category: ing.category ?? "Other",
        isChecked: isCheckedMap.get(key) ?? false,
      });

      const existing = aggregated.get(key);

      if (existing) {
        existing.quantity += parsed.value * scale;
      } else {
        aggregated.set(key, {
          ingredientKey: key,
          name: ing.name,
          quantity: parsed.value * scale,
          unit: parsed.unit,
          category: ing.category ?? "Other",
          isChecked: isCheckedMap.get(key) ?? false,
        });
      }
    }
  }

  /* ───────── from manual items ───────── */

  for (const m of manualItems) {
    const key = m.ingredientKey;
    const existing = aggregated.get(key);

    if (existing) {
      existing.quantity += m.quantity;
    } else {
      aggregated.set(key, {
        ingredientKey: key,
        name: key,
        quantity: m.quantity,
        unit: m.unit,
        category: m.category ?? "Other",
        isChecked: isCheckedMap.get(key) ?? false,
      });
    }
  }

  /* ───────── group by category ───────── */

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of aggregated.values()) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }

  return groups;
}

/* ───────── GET: shared shopping list ───────── */

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
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
      { error: "Link expired or not found" },
      { status: 404 },
    );
  }

  const groups = aggregateShoppingList(list);

  return NextResponse.json({
    title: list.title,
    groups,
  });
}
