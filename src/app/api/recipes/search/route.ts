import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";

    // ✅ support: cuisine=Indian,Italian
    // ✅ support: cuisine=Indian&cuisine=Italian
    const cuisineParams = searchParams.getAll("cuisine");
    const cuisines =
      cuisineParams.length > 1
        ? cuisineParams
        : cuisineParams
            .flatMap((c) => c.split(","))
            .map((c) => c.trim())
            .filter(Boolean);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    /* ───────── build where clause ───────── */

    const where: Prisma.RecipeWhereInput = {};

    // 🔍 search (optional)
    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          description: {
            contains: q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    // 🎛️ cuisine filter (multi-value)
    if (cuisines.length > 0) {
      where.cuisine = {
        in: cuisines,
      };
    }

    /* ───────── queries ───────── */

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          ingredients: true,
          steps: { orderBy: { stepNo: "asc" } },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      data: recipes,
      page,
      hasMore: skip + recipes.length < total,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
