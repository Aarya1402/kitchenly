import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CATEGORY } from "@/constants/default-category";
import { CATEGORY_MAP } from "@/constants/category-map";
import type {
  RecipeInListCreateInput,
  ManualItemCreateInput,
} from "@/types/shoppingListApi";

function inferCategory(ingredientName: string): string {
  const key = ingredientName.split(" ")[0].toLowerCase();
  return CATEGORY_MAP[key] || DEFAULT_CATEGORY;
}
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, recipes, manualItems } = body;

  if (!Array.isArray(recipes) || recipes.length === 0) {
    return NextResponse.json(
      { error: "At least one recipe is required" },
      { status: 400 },
    );
  }

  try {
    const list = await prisma.shoppingList.create({
      data: {
        userId,
        title: title || "Shopping List",

        // ✅ Persist recipe structure
        recipes: {
          create: recipes.map((r: RecipeInListCreateInput) => ({
            recipeId: r.recipeId,
            recipeTitle: r.title,
            baseServings: r.baseServings ?? 4, // Fallback to safe default if missing
            servingsUsed: r.servingsUsed,
          })),
        },

        // ✅ Optional manual items
        ...(Array.isArray(manualItems) && manualItems.length > 0
          ? {
              manualItems: {
                create: manualItems.map((i: ManualItemCreateInput) => ({
                  ingredientKey: i.ingredientKey,
                  quantity: i.quantity,
                  unit: i.unit,
                  category: i.category || inferCategory(i.ingredientKey), // Use provided category if available
                })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      id: list.id,
    });
  } catch (error) {
    console.error("Failed to create shopping list:", error);
    return NextResponse.json(
      { error: "Failed to create shopping list" },
      { status: 500 },
    );
  }
}



/* ───────── GET: list all shopping lists ───────── */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.shoppingList.findMany({
    where: { userId },
    include: {
      itemStates: true, // 👈 THIS is the source of truth
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    lists: lists.map((list) => {
      const total = list.itemStates.length;

      const completed = list.itemStates.filter(
        (item) => item.isChecked === true,
      ).length;

      return {
        id: list.id,
        title: list.title,
        createdAt: list.createdAt,
        total,
        completed,
      };
    }),
  });
}
