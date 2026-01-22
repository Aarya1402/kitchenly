import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json({
        data: [],
        page,
        hasMore: false,
      });
    }

    const where: Prisma.RecipeWhereInput = {
      OR: [
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
      ],
    };

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
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}

