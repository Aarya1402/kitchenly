"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { CATEGORY_MAP } from "@/constants/category-map";
import { DEFAULT_CATEGORY } from "@/constants/default-category";
import { prisma } from "@/lib/db";
import type { AggregatedItem } from "@/types/aggregatedItems";
import type {
  ManualItemCreateInput,
  RecipeInListCreateInput,
} from "@/types/shoppingListApi";

/* ───────── Helpers ───────── */

function inferCategory(ingredientName: string): string {
  const key = ingredientName.split(" ")[0].toLowerCase();
  return CATEGORY_MAP[key] || DEFAULT_CATEGORY;
}

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

function parseIngredientFromString(str: string) {
  // Matches: "100" or "100g" or "100 g" or "2-3 g" (taking lower bound)
  const match = str
    .trim()
    .match(/^([\d.]+)(?:\s*-\s*[\d.]+)?\s*([a-zA-Z%]+)?\s*(.*)$/);

  if (match) {
    const value = Number(match[1]);
    let unit = match[2] || "piece";
    let name = match[3] || "";

    // Heuristic: if name is empty and unit looks like a name (not a known short unit), swap them
    // This handles "1 onion" -> val=1, unit="onion", name="" => val=1, unit="piece", name="onion"
    const COMMON_UNITS = new Set([
      "g",
      "kg",
      "ml",
      "l",
      "oz",
      "lb",
      "cup",
      "cups",
      "tbsp",
      "tsp",
      "pinch",
      "piece",
      "pieces",
    ]);
    if (!name && unit && !COMMON_UNITS.has(unit.toLowerCase())) {
      name = unit;
      unit = "piece";
    }

    return { value, unit, name };
  }
  return null;
}

/* ───────── Actions ───────── */

export async function createShoppingList(data: {
  title: string;
  recipes: RecipeInListCreateInput[];
  manualItems?: ManualItemCreateInput[];
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, recipes, manualItems } = data;

  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new Error("At least one recipe is required");
  }

  try {
    const list = await prisma.shoppingList.create({
      data: {
        userId,
        title: title || "Shopping List",
        recipes: {
          create: recipes.map((r) => ({
            recipeId: r.recipeId,
            recipeTitle: r.title,
            baseServings: r.baseServings ?? 4,
            servingsUsed: r.servingsUsed,
          })),
        },
        ...(Array.isArray(manualItems) && manualItems.length > 0
          ? {
              manualItems: {
                create: manualItems.map((i) => ({
                  ingredientKey: i.ingredientKey,
                  quantity: i.quantity,
                  unit: i.unit,
                  category: i.category || inferCategory(i.ingredientKey),
                })),
              },
            }
          : {}),
      },
    });

    revalidatePath("/shopping-lists");
    return { success: true, id: list.id };
  } catch (error) {
    console.error("Failed to create shopping list:", error);
    throw new Error("Failed to create shopping list");
  }
}

export async function getShoppingLists() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const lists = await prisma.shoppingList.findMany({
    where: { userId },
    include: {
      itemStates: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return lists.map((list) => {
    const total = list.itemStates.length;
    const completed = list.itemStates.filter(
      (item) => item.isChecked === true
    ).length;

    return {
      id: list.id,
      title: list.title,
      createdAt: list.createdAt,
      total,
      completed,
    };
  });
}

export async function getShoppingList(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
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
    return null;
  }

  /* ───────── Build Response (Aggregation) ───────── */

  const isCheckedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked])
  );

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
      let parsed = parseQuantity(ing.quantity);
      let finalName = ing.name;

      // FIX: If quantity is default (1 piece) AND name starts with number, try to parse name
      if (
        parsed.value === 1 &&
        parsed.unit === "piece" &&
        /^\d/.test(ing.name)
      ) {
        const better = parseIngredientFromString(ing.name);
        if (better) {
          parsed = { value: better.value, unit: better.unit };
          finalName = better.name;
        }
      }

      const key = canonicalizeName(finalName);
      const existing = aggregated.get(key);

      if (existing) {
        existing.quantity += parsed.value * scale;
      } else {
        aggregated.set(key, {
          ingredientKey: key,
          name: finalName,
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

  return {
    id: list.id,
    title: list.title,
    recipes: list.recipes.map((r) => ({
      recipeId: r.recipeId,
      title: r.recipeTitle,
      baseServings: r.baseServings,
      servingsUsed: r.servingsUsed,
    })),
    groups,
  };
}

export async function addRecipeToShoppingList(
  shoppingListId: string,
  recipeId: string,
  servingsUsed?: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const list = await prisma.shoppingList.findUnique({
    where: { id: shoppingListId },
    include: { recipes: true },
  });

  if (!list || list.userId !== userId) {
    throw new Error("Shopping list not found");
  }

  const alreadyExists = list.recipes.some((r) => r.recipeId === recipeId);
  if (alreadyExists) {
    throw new Error("Recipe already added to this list");
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });

  if (!recipe || recipe.userId !== userId) {
    throw new Error("Recipe not found");
  }

  await prisma.recipeInList.create({
    data: {
      shoppingListId,
      recipeId,
      recipeTitle: recipe.title,
      baseServings: recipe.servings,
      servingsUsed: servingsUsed ?? recipe.servings,
    },
  });

  revalidatePath(`/shopping-lists/${shoppingListId}`);
  return { success: true };
}

/* ───────── Additional Actions ───────── */

export async function previewShoppingList(recipeIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (recipeIds.length === 0) {
    return { recipes: [], groups: {} };
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      id: { in: recipeIds },
    },
    include: {
      ingredients: true,
    },
  });

  /* ───────── Aggregate ingredients ───────── */

  const aggregated = new Map<string, AggregatedItem>();

  for (const recipe of recipes) {
    // defaults
    const scaleFactor = 1;

    for (const ing of recipe.ingredients) {
      const parsed = parseQuantity(ing.quantity);
      const ingredientKey = canonicalizeName(ing.name);

      const existing = aggregated.get(ingredientKey);

      if (existing) {
        // simple merge logic
        if (existing.unit === parsed.unit) {
          existing.quantity += parsed.value * scaleFactor;
        } else {
          // different unit → append key to allow distinct items or handle unit conversion in future
          const key = `${ingredientKey}:${parsed.unit}`;
          if (aggregated.has(key)) {
            aggregated.get(key)!.quantity += parsed.value * scaleFactor;
          } else {
            aggregated.set(key, {
              ingredientKey: key,
              name: ing.name,
              quantity: parsed.value * scaleFactor,
              unit: parsed.unit,
              category: ing.category || inferCategory(ing.name),
              isChecked: false,
            });
          }
        }
      } else {
        aggregated.set(ingredientKey, {
          ingredientKey,
          name: ing.name,
          quantity: parsed.value * scaleFactor,
          unit: parsed.unit,
          category: ing.category || inferCategory(ing.name),
          isChecked: false,
        });
      }
    }
  }

  /* ───────── Group by category ───────── */

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of aggregated.values()) {
    const category = item.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  }

  return {
    recipes: recipes.map((r) => ({
      recipeId: r.id,
      title: r.title,
      baseServings: r.servings,
      servingsUsed: r.servings,
    })),
    groups,
  };
}

export async function toggleItem(
  shoppingListId: string,
  ingredientKey: string,
  isChecked: boolean
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const list = await prisma.shoppingList.findUnique({
    where: { id: shoppingListId },
    include: { itemStates: true },
  });

  if (!list || list.userId !== userId) {
    throw new Error("List not found");
  }

  const existingState = list.itemStates.find(
    (s) => s.ingredientKey === ingredientKey
  );

  if (existingState) {
    await prisma.shoppingItemState.update({
      where: { id: existingState.id },
      data: { isChecked },
    });
  } else {
    await prisma.shoppingItemState.create({
      data: {
        shoppingListId,
        ingredientKey,
        isChecked,
      },
    });
  }

  revalidatePath(`/shopping-lists/${shoppingListId}`);
}

export async function updateShoppingList(
  listId: string,
  data: {
    title?: string;
    recipes?: RecipeInListCreateInput[];
    manualItems?: ManualItemCreateInput[];
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) throw new Error("List not found");

  const { title, manualItems } = data;

  if (manualItems) {
    // Full update of manual items
    await prisma.$transaction([
      prisma.manualItem.deleteMany({
        where: { shoppingListId: listId },
      }),
      prisma.manualItem.createMany({
        data: manualItems.map((i) => ({
          shoppingListId: listId,
          ingredientKey: i.ingredientKey,
          quantity: i.quantity,
          unit: i.unit,
          category: i.category,
        })),
      }),
      prisma.shoppingList.update({
        where: { id: listId },
        data: { title: title ?? list.title },
      }),
    ]);
  } else if (title) {
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { title },
    });
  }

  revalidatePath(`/shopping-lists/${listId}`);
  return { success: true };
}

export async function shareShoppingList(listId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const list = await prisma.shoppingList.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) throw new Error("Not found");

  if (list.shareToken) return { token: list.shareToken };

  const { randomUUID } = await import("node:crypto");
  const token = randomUUID();

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { shareToken: token, isShared: true },
  });

  return { token };
}

export async function unshareShoppingList(listId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.shoppingList.update({
    where: { id: listId },
    data: { shareToken: null, isShared: false },
  });

  return { success: true };
}

export async function regenerateShoppingList(
  listId: string,
  recipeId: string,
  servingsUsed: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    include: { recipes: true },
  });

  if (!list || list.userId !== userId) throw new Error("List not found");

  const recipeInList = list.recipes.find((r) => r.recipeId === recipeId);
  if (!recipeInList) throw new Error("Recipe not in list");

  await prisma.recipeInList.update({
    where: { id: recipeInList.id },
    data: { servingsUsed },
  });

  revalidatePath(`/shopping-lists/${listId}`);
  return { success: true };
}

export async function searchShoppingList(
  listId: string,
  query?: string,
  categories?: string
) {
  // Reuse getShoppingList logic but filter in-memory or improve DB query
  // Since aggregation is complex, in-memory filtering of the result from getShoppingList is properly easiest
  const listData = await getShoppingList(listId);
  if (!listData) throw new Error("List not found");

  // Filtering logic
  const catArray = categories ? categories.split(",") : [];
  const qLower = query?.toLowerCase() || "";

  const filteredGroups: Record<string, AggregatedItem[]> = {};

  for (const [category, items] of Object.entries(listData.groups)) {
    // Filter by category
    if (catArray.length > 0 && !catArray.includes(category)) {
      continue;
    }

    // Filter by query (name)
    const matchingItems = items.filter((item) =>
      item.name.toLowerCase().includes(qLower)
    );

    if (matchingItems.length > 0) {
      filteredGroups[category] = matchingItems;
    }
  }

  return { groups: filteredGroups };
}

// Public access for shared list
export async function getSharedShoppingList(token: string) {
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

  if (!list) return null;

  /* ───────── Build Response (Aggregation) ───────── */

  const isCheckedMap = new Map(
    list.itemStates.map((s) => [s.ingredientKey, s.isChecked])
  );

  const aggregated = new Map<string, AggregatedItem>();

  // from recipes
  for (const r of list.recipes) {
    const scale = r.servingsUsed / r.baseServings;

    for (const ing of r.recipe.ingredients) {
      let parsed = parseQuantity(ing.quantity);
      let finalName = ing.name;

      // FIX: If quantity is default (1 piece) AND name starts with number, try to parse name
      if (
        parsed.value === 1 &&
        parsed.unit === "piece" &&
        /^\d/.test(ing.name)
      ) {
        const better = parseIngredientFromString(ing.name);
        if (better) {
          parsed = { value: better.value, unit: better.unit };
          finalName = better.name;
        }
      }

      const key = canonicalizeName(finalName);
      const existing = aggregated.get(key);

      if (existing) {
        existing.quantity += parsed.value * scale;
      } else {
        aggregated.set(key, {
          ingredientKey: key,
          name: finalName,
          quantity: parsed.value * scale,
          unit: parsed.unit,
          category: ing.category || "Other",
          isChecked: isCheckedMap.get(key) ?? false,
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
        isChecked: isCheckedMap.get(m.ingredientKey) ?? false,
      });
    }
  }

  const groups: Record<string, AggregatedItem[]> = {};

  for (const item of aggregated.values()) {
    const category = item.category || "Other";

    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
  }

  return {
    title: list.title,
    groups,
  };
}
