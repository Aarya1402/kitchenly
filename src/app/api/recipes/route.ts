import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import axios from "axios";
import { uploadImageBuffer } from "@/services/cloudinary-upload";
import { normalizeIngredient } from "@/lib/ingredient-normalizer";

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  let finalImageUrl: string | null = null;

  /* ───────── Upload external image directly ───────── */

  if (body.imageUrl) {
    try {
      const imageRes = await axios.get(body.imageUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(imageRes.data);
      finalImageUrl = await uploadImageBuffer(buffer);
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      finalImageUrl = null; // do NOT block save
    }
  }

  /* ───────── Save recipe ───────── */

  const recipe = await prisma.recipe.create({
    data: {
      userId,
      title: body.title,
      description: body.description,
      servings: body.servings,
      dietaryTags: body.dietaryTags,
      imageUrl: finalImageUrl,

      ingredients: {
  create: body.ingredients.map(normalizeIngredient),
},

      steps: {
        create: body.steps.map((content: string, i: number) => ({
          stepNo: i + 1,
          content,
        })),
      },
    },
  });

  return NextResponse.json({ success: true, recipe });
}

