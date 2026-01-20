import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 10, 1),
    50
  );

  const skip = (page - 1) * limit;

  const [total, recipes] = await Promise.all([
    prisma.recipe.count({
      where: { userId },
    }),

    prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        ingredients: {
          select: { name: true, quantity: true },
        },
        steps: {
          select: { stepNo: true, content: true },
          orderBy: { stepNo: "asc" },
        },
      },
    }),
  ]);

  return NextResponse.json({
    data: recipes,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + recipes.length < total,
  });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { title, description, servings, dietaryTags, ingredients, steps,imageUrl } =
    body;

  // Basic validation
  if (
    !title ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    !Array.isArray(steps) ||
    steps.length === 0
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      userId: session.userId,
      title,
      description,
      servings,
      dietaryTags,
      imageUrl,

      ingredients: {
        create: ingredients.map((item: { name: string; quantity: string }) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      },

      steps: {
        create: steps.map((content: string, index: number) => ({
          stepNo: index + 1,
          content,
        })),
      },
    },
  });

  return NextResponse.json({ id: recipe.id });
}
