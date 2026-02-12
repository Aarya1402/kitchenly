import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { normalizeIngredient } from "@/lib/ingredient-normalizer";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      steps: {
        orderBy: { stepNo: "asc" },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  if (!recipe || recipe.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recipe.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
  });

  if (!recipe || recipe.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recipe.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      servings: body.servings,
      dietaryTags: body.dietaryTags,
      ...(body.imageUrl != null && { imageUrl: body.imageUrl }),

      ingredients: {
        deleteMany: {},
        create: body.ingredients.map(normalizeIngredient),
      },

      /* Replace steps */
      steps: {
        deleteMany: {},
        create: body.steps.map((content: string, index: number) => ({
          stepNo: index + 1,
          content,
        })),
      },
    },
  });

  return NextResponse.json({ success: true });
}
